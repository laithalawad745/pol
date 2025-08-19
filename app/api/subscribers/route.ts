import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromToken } from '@/lib/auth'
import { getUnifiedBotInstance } from '@/lib/telegram-bot-manager'  // ✅ الاستيراد الصحيح
import { addDays, addMinutes, addHours } from 'date-fns'

// الحصول على قائمة المشتركين
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

    const subscribers = await prisma.subscriber.findMany({
      where: { adminId: admin.id },
      include: {
        inviteLinks: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        accessLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(subscribers)
  } catch (error) {
    console.error('Error in GET /api/subscribers:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}

// إضافة مشترك جديد
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

    // ✅ التحقق من وجود معرف القناة
    if (!admin.channelId) {
      return NextResponse.json(
        { error: 'يجب إعداد القناة أولاً في الإعدادات' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      telegramId, 
      telegramUsername,
      firstName,
      lastName,
      durationType,
      durationValue 
    } = body

    // ✅ التحقق من صحة البيانات
    if (!telegramId || !durationType || !durationValue) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      )
    }

    // التحقق من صحة Telegram ID
    const cleanTelegramId = telegramId.trim()
    if (!/^\d+$/.test(cleanTelegramId)) {
      return NextResponse.json(
        { error: 'معرف التلغرام يجب أن يكون رقماً فقط' },
        { status: 400 }
      )
    }

    // حساب تاريخ انتهاء الاشتراك
    let subscriptionEnd: Date
    const now = new Date()
    
    switch (durationType) {
      case 'minutes':
        subscriptionEnd = addMinutes(now, Number(durationValue))
        break
      case 'hours':
        subscriptionEnd = addHours(now, Number(durationValue))
        break
      case 'days':
      default:
        subscriptionEnd = addDays(now, Number(durationValue))
        break
    }

    // التحقق من وجود المشترك مسبقاً لنفس الـ Admin
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { 
        telegramId_adminId: {
          telegramId: cleanTelegramId,
          adminId: admin.id
        }
      }
    })

    let subscriber

    if (existingSubscriber) {
      // تحديث الاشتراك الموجود
      subscriber = await prisma.subscriber.update({
        where: { 
          id: existingSubscriber.id
        },
        data: {
          subscriptionEnd,
          subscriptionStart: now,
          isActive: true,
          telegramUsername: telegramUsername || existingSubscriber.telegramUsername,
          firstName: firstName || existingSubscriber.firstName,
          lastName: lastName || existingSubscriber.lastName
        }
      })
      console.log('Updated existing subscriber:', subscriber.id)
    } else {
      // إنشاء مشترك جديد
      subscriber = await prisma.subscriber.create({
        data: {
          telegramId: cleanTelegramId,
          telegramUsername: telegramUsername || null,
          firstName: firstName || null,
          lastName: lastName || null,
          subscriptionStart: now,
          subscriptionEnd,
          isActive: true,
          adminId: admin.id
        }
      })
      console.log('Created new subscriber:', subscriber.id)
    }

    // إرسال رابط الدعوة عبر البوت
    let inviteSent = false
    let notificationSent = false
    
    try {
      const bot = getUnifiedBotInstance()  // ✅ استخدام الدالة الصحيحة
      
      if (bot && bot.bot) {
        // إعادة تحميل القنوات للتأكد من وجود القناة الجديدة
        await bot.reloadChannelMappings()
        
        if (existingSubscriber) {
          // التحقق من حالة الاشتراك السابقة
          const wasActive = existingSubscriber.isActive && 
                          new Date(existingSubscriber.subscriptionEnd) > now
          
          if (wasActive) {
            // المشترك كان نشطاً - نرسل رسالة تمديد فقط
            try {
              const durationText = durationType === 'days' 
                ? `${durationValue} يوم` 
                : durationType === 'hours' 
                ? `${durationValue} ساعة` 
                : `${durationValue} دقيقة`
              
              await bot.bot.telegram.sendMessage(
                subscriber.telegramId,
                `✅ تم تجديد اشتراكك بنجاح!\n\n` +
                `📢 القناة: ${admin.channelName || 'القناة'}\n` +
                `⏱ مدة الاشتراك الجديد: ${durationText}\n` +
                `📅 صالح من: ${subscriber.subscriptionStart.toLocaleDateString('ar-EG')}\n` +
                `📅 حتى: ${subscriber.subscriptionEnd.toLocaleDateString('ar-EG')}\n\n` +
                `🎉 اشتراكك نشط ويمكنك الاستمرار في القناة!`
              )
              
              notificationSent = true
              console.log('✅ Renewal notification sent to:', subscriber.telegramId)
            } catch (e) {
              console.error('Error sending renewal notification:', e)
            }
          } else {
            // الاشتراك كان منتهياً - نرسل رابط دعوة
            inviteSent = await bot.sendInviteToSubscriber(subscriber.id)
            if (inviteSent) {
              console.log('✅ Invite sent for expired subscriber:', subscriber.telegramId)
            }
          }
        } else {
          // مشترك جديد تماماً - نرسل رابط دعوة
          inviteSent = await bot.sendInviteToSubscriber(subscriber.id)
          if (inviteSent) {
            console.log('✅ Invite sent to new subscriber:', subscriber.telegramId)
          }
        }
      } else {
        console.log('⚠️ Bot not initialized - no message sent')
      }
    } catch (botError) {
      console.error('❌ Error with bot operations:', botError)
      // لا نريد أن يفشل إضافة المشترك بسبب خطأ في البوت
    }

    // إرجاع البيانات مع حالة الإرسال
    return NextResponse.json({
      ...subscriber,
      inviteSent,
      notificationSent,
      message: notificationSent 
        ? 'تم تجديد الاشتراك وإرسال التأكيد للمشترك'
        : inviteSent 
        ? 'تم إضافة المشترك وإرسال الدعوة بنجاح' 
        : 'تم إضافة المشترك لكن فشل إرسال الرسالة. تحقق من إعدادات البوت.'
    })
    
  } catch (error) {
    console.error('❌ Error in POST /api/subscribers:', error)
    
    // معالجة أخطاء Prisma المحددة
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'هذا المشترك موجود بالفعل' },
          { status: 400 }
        )
      }
    }
    
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