// app/api/super-admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // البحث عن Super Admin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { username }
    })

    if (!superAdmin) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, superAdmin.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      )
    }

    // إنشاء توكن خاص للـ Super Admin
    const token = jwt.sign(
      { id: superAdmin.id, role: 'super_admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({
      success: true,
      user: {
        id: superAdmin.id,
        username: superAdmin.username,
        role: 'super_admin'
      }
    })

    response.cookies.set('super-admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('Super admin login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}