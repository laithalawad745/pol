// app/api/super-admin/admins/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyToken } from '@/lib/auth'

// دالة للتحقق من Super Admin
async function verifySuperAdmin(request: NextRequest) {
  const token = request.cookies.get('super-admin-token')?.value
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'super_admin') return null
  
  return prisma.superAdmin.findUnique({
    where: { id: payload.id }
  })
}

// جلب جميع الـ Admins
export async function GET(request: NextRequest) {
  try {
    const superAdmin = await verifySuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admins = await prisma.admin.findMany({
      include: {
        _count: {
          select: { subscribers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// إنشاء Admin جديد
export async function POST(request: NextRequest) {
  try {
    const superAdmin = await verifySuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const data = await request.json()
    
    // التحقق من عدم تكرار البريد الإلكتروني
    if (data.email) {
      const existingEmail = await prisma.admin.findFirst({
        where: { email: data.email }
      })
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // استخدام الإيميل كـ username إذا لم يتم تحديد username
    const username = data.username || data.email

    // التحقق من عدم تكرار اسم المستخدم
    const existing = await prisma.admin.findUnique({
      where: { username }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'اسم المستخدم موجود بالفعل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(data.password)

    // إنشاء الحساب
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        email: data.email,
        channelId: data.channelId || null,
        channelName: data.channelName || null,
        botToken: data.botToken || null,
        botUsername: data.botUsername || null,
        planType: data.planType || 'basic',
        planExpiry: data.planExpiry ? new Date(data.planExpiry) : null,
        maxSubscribers: data.maxSubscribers || 100,
        isActive: true,
        isPaid: data.isPaid || false
      }
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الحساب' },
      { status: 500 }
    )
  }
}