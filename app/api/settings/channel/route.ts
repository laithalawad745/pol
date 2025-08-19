// app/api/settings/channel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await getAdminFromToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const data = await request.json()

    // التحقق من صحة معرف القناة
    if (!data.channelId || !data.channelId.startsWith('-100')) {
      return NextResponse.json(
        { error: 'معرف القناة غير صحيح. يجب أن يبدأ بـ -100' },
        { status: 400 }
      )
    }

    // التحقق من عدم استخدام نفس القناة من admin آخر
    const existingChannel = await prisma.admin.findFirst({
      where: {
        channelId: data.channelId,
        id: { not: admin.id }
      }
    })

    if (existingChannel) {
      return NextResponse.json(
        { error: 'هذه القناة مسجلة بالفعل لحساب آخر' },
        { status: 400 }
      )
    }

    // تحديث بيانات القناة
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        channelId: data.channelId,
        channelName: data.channelName || null
      }
    })

    // إعادة تحميل القنوات في البوت - مؤقتاً معطل
    // إذا كان لديك ملف البوت، فعّل هذا السطر:
    // const bot = getBotInstance() // أو getUnifiedBotInstance()
    // if (bot) {
    //   await bot.reloadChannelMappings()
    // }

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
      message: 'تم حفظ إعدادات القناة بنجاح'
    })
  } catch (error) {
    console.error('Error updating channel settings:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    )
  }
}