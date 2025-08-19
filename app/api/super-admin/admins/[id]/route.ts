// app/api/super-admin/admins/[id]/route.ts
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

// تحديث Admin
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const superAdmin = await verifySuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const data = await request.json()

    const updateData: any = {}
    
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.isPaid !== undefined) updateData.isPaid = data.isPaid
    if (data.planType) updateData.planType = data.planType
    if (data.planExpiry) updateData.planExpiry = new Date(data.planExpiry)
    if (data.maxSubscribers) updateData.maxSubscribers = data.maxSubscribers
    if (data.channelId) updateData.channelId = data.channelId
    if (data.channelName) updateData.channelName = data.channelName
    if (data.botToken) updateData.botToken = data.botToken
    if (data.botUsername) updateData.botUsername = data.botUsername

    const admin = await prisma.admin.update({
where: { id },      data: updateData
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في التحديث' },
      { status: 500 }
    )
  }
}

// حذف Admin
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const superAdmin = await verifySuperAdmin(request)
    if (!superAdmin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // حذف جميع البيانات المرتبطة سيتم تلقائياً بسبب onDelete: Cascade
    await prisma.admin.delete({
where: { id }    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الحذف' },
      { status: 500 }
    )
  }
}