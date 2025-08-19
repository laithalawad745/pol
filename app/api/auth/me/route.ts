// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await getAdminFromToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // إرجاع بيانات Admin بدون كلمة المرور
    const { password, ...adminData } = admin

    console.log('Admin data:', adminData) // للتأكد من البيانات
    console.log('Channel ID:', adminData.channelId) // للتأكد من معرف القناة

    return NextResponse.json(adminData)
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    )
  }
}