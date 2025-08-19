// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('Login attempt for:', username)

    // البحث عن Admin (وليس Super Admin)
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
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // إنشاء التوكن
    const token = generateToken(admin.id, 'admin')

    // تسجيل النشاط
    await prisma.adminLog.create({
      data: {
        action: 'login',
        adminId: admin.id,
        details: 'Successful login'
      }
    })

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        channelId: admin.channelId,
        channelName: admin.channelName,
        planType: admin.planType,
        maxSubscribers: admin.maxSubscribers
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 أيام
    })

    console.log('Login successful!')
    return response
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}


