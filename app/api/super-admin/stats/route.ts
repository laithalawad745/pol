// app/api/super-admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

export async function GET(request: NextRequest) {
  try {
    const superAdmin = await verifySuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const [totalAdmins, activeAdmins, totalSubscribers, payments] = await Promise.all([
      prisma.admin.count(),
      prisma.admin.count({ where: { isActive: true } }),
      prisma.subscriber.count(),
      prisma.payment.aggregate({
        _sum: { amount: true }
      })
    ])

    return NextResponse.json({
      totalAdmins,
      activeAdmins,
      totalSubscribers,
      totalRevenue: payments._sum.amount || 0
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإحصائيات' },
      { status: 500 }
    )
  }
}