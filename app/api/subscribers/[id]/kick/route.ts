import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromToken } from '@/lib/auth'
import { getUnifiedBotInstance } from '@/lib/telegram-bot-manager'

// طرد مشترك من القناة
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await getAdminFromToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    if (!admin.channelId) {
      return NextResponse.json(
        { error: 'القناة غير محددة' },
        { status: 400 }
      )
    }

    // البحث عن المشترك
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        id: id,
        adminId: admin.id
      }
    })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'المشترك غير موجود' },
        { status: 404 }
      )
    }

    // طرد المشترك من القناة
    const bot = getUnifiedBotInstance()
    
    if (bot && bot.bot) {
      try {
        const telegramId = parseInt(subscriber.telegramId)
        
        if (!isNaN(telegramId)) {
          // حظر المستخدم من القناة
          await bot.bot.telegram.banChatMember(admin.channelId, telegramId)
          
          // إلغاء الحظر بعد ثانية (للسماح بالانضمام مستقبلاً)
          setTimeout(async () => {
            try {
              // التحقق من وجود bot.bot قبل الاستخدام
              if (bot && bot.bot && admin.channelId) {
                await bot.bot.telegram.unbanChatMember(admin.channelId, telegramId)
              }
            } catch (e) {
              console.error('Error unbanning:', e)
            }
          }, 1000)
          
          // إشعار المستخدم
          try {
            await bot.bot.telegram.sendMessage(
              subscriber.telegramId,
              '⚠️ تم إيقاف اشتراكك مؤقتاً!\n\n' +
              `📢 القناة: ${admin.channelName || 'القناة'}\n` +
              '📞 للمزيد من المعلومات تواصل مع المسؤول.'
            )
          } catch (e) {
            console.error('Could not notify user:', e)
          }
          
          console.log(`✅ Kicked subscriber ${subscriber.telegramId} from channel ${admin.channelId}`)
        }
      } catch (error: any) {
        if (error.message?.includes('USER_NOT_PARTICIPANT')) {
          console.log('User already left the channel')
        } else {
          console.error('Error kicking subscriber:', error)
          // نستمر حتى لو فشل الطرد من التلغرام
        }
      }
    }

    // تحديث حالة المشترك في قاعدة البيانات
    const updatedSubscriber = await prisma.subscriber.update({
      where: { id: id },
      data: { 
        isActive: false,
        subscriptionEnd: new Date() // إنهاء الاشتراك فوراً
      }
    })

    // تسجيل العملية
    await prisma.accessLog.create({
      data: {
        action: 'KICKED_BY_ADMIN',
        telegramId: subscriber.telegramId,
        subscriberId: subscriber.id,
        details: `Kicked by admin ${admin.username}`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'تم طرد المشترك بنجاح',
      subscriber: updatedSubscriber
    })
    
  } catch (error) {
    console.error('Error in kick endpoint:', error)
    
    return NextResponse.json(
      { 
        error: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined
      },
      { status: 500 }
    )
  }
}