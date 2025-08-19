import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromToken } from '@/lib/auth'
import { getUnifiedBotInstance } from '@/lib/telegram-bot-manager'  // ✅ الاستيراد الصحيح
import { addDays, addMinutes, addHours } from 'date-fns'

// تحديث مشترك
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await getAdminFromToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      durationType,
      durationValue,
      isActive
    } = body

    let updateData: any = {}
    
    // تحديث حالة النشاط إذا تم تحديدها
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }

    // تحديث مدة الاشتراك إذا تم تحديدها
    if (durationType && durationValue) {
      const now = new Date()
      
      switch (durationType) {
        case 'minutes':
          updateData.subscriptionEnd = addMinutes(now, Number(durationValue))
          break
        case 'hours':
          updateData.subscriptionEnd = addHours(now, Number(durationValue))
          break
        case 'days':
        default:
          updateData.subscriptionEnd = addDays(now, Number(durationValue))
          break
      }
      
      updateData.subscriptionStart = now
      updateData.isActive = true // تفعيل الاشتراك عند التجديد
    }

    // التحقق من وجود المشترك أولاً
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: {
        id: id,
        adminId: admin.id
      }
    })

    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'المشترك غير موجود' },
        { status: 404 }
      )
    }

    // تحديث المشترك
    const subscriber = await prisma.subscriber.update({
      where: { 
        id: id
      },
      data: updateData
    })

    // إذا تم تجديد/تمديد الاشتراك
    if (durationType && durationValue) {
      try {
        const bot = getUnifiedBotInstance()
        
        if (bot && bot.bot && admin.channelId) {
          const now = new Date()
          
          // التحقق من حالة الاشتراك السابقة
          const wasActive = existingSubscriber.isActive && 
                           new Date(existingSubscriber.subscriptionEnd) > now
          
          if (wasActive) {
            // المشترك نشط بالفعل - نرسل رسالة تأكيد فقط
            try {
              const durationText = durationType === 'days' 
                ? `${durationValue} يوم` 
                : durationType === 'hours' 
                ? `${durationValue} ساعة` 
                : `${durationValue} دقيقة`
              
              await bot.bot.telegram.sendMessage(
                subscriber.telegramId,
                `✅ تم تمديد اشتراكك بنجاح!\n\n` +
                `📢 القناة: ${admin.channelName || 'القناة'}\n` +
                `⏱ المدة المضافة: ${durationText}\n` +
                `📅 الاشتراك الجديد صالح حتى:\n` +
                `${subscriber.subscriptionEnd.toLocaleDateString('ar-EG')}\n` +
                `${subscriber.subscriptionEnd.toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}\n\n` +
                `🎉 استمتع بالمحتوى!`
              )
              
              console.log('✅ Extension notification sent to:', subscriber.telegramId)
            } catch (e) {
              console.error('Error sending extension notification:', e)
            }
          } else {
            // الاشتراك كان منتهياً - نرسل رابط دعوة جديد
            await bot.reloadChannelMappings()
            const inviteSent = await bot.sendInviteToSubscriber(subscriber.id)
            
            if (inviteSent) {
              console.log('✅ Renewal invite sent to:', subscriber.telegramId)
            }
          }
        }
      } catch (error) {
        console.error('Error handling subscription update:', error)
      }
    }

    return NextResponse.json({
      ...subscriber,
      message: 'تم تحديث المشترك بنجاح'
    })
    
  } catch (error) {
    console.error('Error in PUT /api/subscribers/[id]:', error)
    
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

// حذف مشترك
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const admin = await getAdminFromToken(token)
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
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

    // طرد المشترك من القناة إذا كان البوت متاحاً
    if (admin.channelId) {
      try {
        const bot = getUnifiedBotInstance()  // ✅ استخدام الدالة الصحيحة
        
        if (bot) {
          const telegramId = parseInt(subscriber.telegramId)
          
          if (!isNaN(telegramId)) {
            try {
              // استخدام Telegraf من خلال البوت
              // ملاحظة: قد نحتاج لإضافة دالة kickUser في telegram-bot-manager.ts
              await bot.bot?.telegram.banChatMember(admin.channelId, telegramId)
              
              // إلغاء الحظر بعد ثانية واحدة (للسماح بالانضمام مستقبلاً)
              setTimeout(async () => {
                try {
                  await bot.bot?.telegram.unbanChatMember(admin.channelId!, telegramId)
                } catch (e) {
                  console.error('Error unbanning:', e)
                }
              }, 1000)
              
              console.log('✅ Kicked subscriber from channel:', subscriber.telegramId)
            } catch (kickError: any) {
              if (kickError.message?.includes('USER_NOT_PARTICIPANT')) {
                console.log('User already left the channel')
              } else {
                console.error('Error kicking subscriber:', kickError)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error with bot operations:', error)
        // نستمر في الحذف حتى لو فشل الطرد
      }
    }

    // حذف المشترك من قاعدة البيانات
    await prisma.subscriber.delete({
      where: { id: id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف المشترك بنجاح'
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/subscribers/[id]:', error)
    
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