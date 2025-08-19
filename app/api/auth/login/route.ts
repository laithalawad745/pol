import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    // التحقق من وجود البيانات المطلوبة
    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }
    
    console.log('Login attempt for:', username)

    // البحث عن Admin
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      console.log('Admin not found')
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // التحقق من أن الحساب نشط
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'الحساب معطل. تواصل مع المدير العام.' },
        { status: 403 }
      )
    }

    console.log('Admin found:', admin.id)

    // التحقق من كلمة المرور
    const isValid = await verifyPassword(password, admin.password)

    if (!isValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // إنشاء التوكن
    const token = generateToken(admin.id, 'admin')

    // تسجيل النشاط
    try {
      await prisma.adminLog.create({
        data: {
          action: 'login',
          adminId: admin.id,
          details: 'Successful login',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
    } catch (logError) {
      console.error('Error logging activity:', logError)
      // نستمر حتى لو فشل تسجيل النشاط
    }

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        channelId: admin.channelId,
        channelName: admin.channelName,
        planType: admin.planType,
        maxSubscribers: admin.maxSubscribers,
        isPaid: admin.isPaid,
        isActive: admin.isActive
      }
    })

    // إعداد الكوكيز
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: '/'
    })

    console.log('Login successful!')
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    
    // تفاصيل أكثر عن الخطأ في وضع التطوير
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `خطأ: ${error instanceof Error ? error.message : 'Unknown error'}`
      : 'حدث خطأ في الخادم'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// دالة GET للتحقق من حالة API
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Login API is working',
    timestamp: new Date().toISOString()
  })
}