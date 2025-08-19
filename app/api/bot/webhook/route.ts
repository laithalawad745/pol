// app/api/bot/webhook/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUnifiedBotInstance } from '@/lib/telegram-bot-manager';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const update = await request.json();
    console.log('📨 Webhook update:', JSON.stringify(update, null, 2));

    const botManager = getUnifiedBotInstance();
    const bot = botManager?.bot;

    if (!bot) {
      console.error('❌ Bot not initialized');
      return NextResponse.json({ error: 'Bot not initialized' }, { status: 500 });
    }

    // معالجة طلبات الانضمام
    if (update.chat_join_request) {
      await handleJoinRequest(update.chat_join_request, bot);
    }

    // معالجة انضمام أعضاء جدد (في حالة القنوات المفتوحة)
    if (update.message && update.message.new_chat_members) {
      await handleNewMembers(update.message, bot);
    }

    // معالجة مغادرة الأعضاء
    if (update.message && update.message.left_chat_member) {
      await handleLeftMember(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ خطأ في webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// معالجة طلبات الانضمام الجديدة
async function handleJoinRequest(joinRequest: any, bot: any) {
  const chatId = joinRequest.chat.id.toString();
  const userId = joinRequest.from.id.toString();
  const inviteLink = joinRequest.invite_link;

  console.log(`📋 طلب انضمام من ${userId} للقناة ${chatId}`);

  try {
    // البحث عن المشترك المصرح له
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        telegramId: userId,
        isActive: true,
        subscriptionEnd: { gt: new Date() }
      },
      include: { 
        admin: true,
        inviteLinks: {
          where: {
            isUsed: false,
            expiresAt: { gt: new Date() }
          }
        }
      }
    });

    if (subscriber && subscriber.admin.channelId === chatId) {
      console.log(`✅ طلب مصرح من المستخدم الصحيح: ${userId}`);

      // قبول الطلب
      try {
        await bot.telegram.approveChatJoinRequest(
          parseInt(chatId), 
          parseInt(userId)
        );

        // تحديث حالة المشترك
        if (subscriber.inviteLinks.length > 0) {
          await prisma.inviteLink.update({
            where: { id: subscriber.inviteLinks[0].id },
            data: { 
              isUsed: true,
              usedAt: new Date()
            }
          });
        }

        // إرسال رسالة ترحيب
        await bot.telegram.sendMessage(parseInt(userId), 
          `🎉 مرحباً بك في ${subscriber.admin.channelName || 'القناة'}!\n\n` +
          `✅ تم قبول طلب انضمامك\n` +
          `📅 اشتراكك ينتهي في: ${new Date(subscriber.subscriptionEnd).toLocaleDateString('ar-EG')}\n\n` +
          `استمتع بالمحتوى! 🚀`
        );

        // تسجيل الدخول
        await prisma.accessLog.create({
          data: {
            action: 'joined_channel',
            telegramId: userId,
            subscriberId: subscriber.id,
            details: `Joined channel ${chatId}`
          }
        });

        console.log(`✅ تم قبول وتأكيد انضمام ${userId}`);
      } catch (error) {
        console.error('خطأ في قبول الطلب:', error);
      }
    } else {
      // مستخدم غير مصرح
      console.log(`❌ طلب غير مصرح من ${userId}`);
      await rejectUnauthorizedRequest(chatId, userId, bot);
    }
  } catch (error) {
    console.error(`❌ خطأ في معالجة طلب الانضمام:`, error);
    // في حالة الخطأ، نرفض الطلب
    try {
      await bot.telegram.declineChatJoinRequest(
        parseInt(chatId), 
        parseInt(userId)
      );
    } catch (e) {
      console.error('خطأ في رفض الطلب:', e);
    }
  }
}

// رفض الطلبات غير المصرحة
async function rejectUnauthorizedRequest(chatId: string, userId: string, bot: any) {
  try {
    // رفض الطلب
    await bot.telegram.declineChatJoinRequest(
      parseInt(chatId), 
      parseInt(userId)
    );

    // إرسال رسالة للمستخدم
    try {
      await bot.telegram.sendMessage(parseInt(userId), 
        `❌ طلب انضمام مرفوض\n\n` +
        `لا تملك دعوة صالحة لهذه القناة.\n\n` +
        `💡 للحصول على دعوة، تواصل مع المشرف.`
      );
    } catch (e) {
      console.log('لم نتمكن من إرسال رسالة للمستخدم');
    }

    console.log(`🚫 تم رفض طلب غير مصرح من ${userId}`);
  } catch (error) {
    console.error('خطأ في رفض الطلب:', error);
  }
}

// معالجة الأعضاء الجدد (للقنوات المفتوحة)
async function handleNewMembers(message: any, bot: any) {
  const chatId = message.chat.id.toString();
  const newMembers = message.new_chat_members;

  for (const newMember of newMembers) {
    if (newMember.is_bot) continue;

    const userId = newMember.id.toString();
    console.log(`👤 عضو جديد انضم مباشرة: ${userId}`);

    // البحث عن المشترك
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        telegramId: userId,
        isActive: true,
        subscriptionEnd: { gt: new Date() }
      },
      include: { admin: true }
    });

    // التحقق من أن المشترك ينتمي لهذه القناة
    if (!subscriber || subscriber.admin.channelId !== chatId) {
      // طرد فوري للأعضاء غير المصرحين
      setTimeout(async () => {
        try {
          await bot.telegram.banChatMember(
            parseInt(chatId), 
            parseInt(userId)
          );
          
          // رفع الحظر بعد ثانية
          setTimeout(async () => {
            await bot.telegram.unbanChatMember(
              parseInt(chatId), 
              parseInt(userId)
            );
          }, 1000);

          await bot.telegram.sendMessage(parseInt(userId), 
            `❌ دخول غير مصرح\n\n` +
            `تم إخراجك من القناة لأنك لا تملك دعوة صالحة.`
          );
        } catch (error) {
          console.error('خطأ في طرد العضو:', error);
        }
      }, 2000);
    }
  }
}

// معالجة مغادرة الأعضاء
async function handleLeftMember(message: any) {
  const chatId = message.chat.id.toString();
  const leftMember = message.left_chat_member;
  
  if (leftMember.is_bot) return;

  const userId = leftMember.id.toString();
  console.log(`👋 العضو ${userId} غادر القناة ${chatId}`);

  try {
    // تسجيل المغادرة
    await prisma.accessLog.create({
      data: {
        action: 'left_channel',
        telegramId: userId,
        details: `Left channel ${chatId}`
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل المغادرة:', error);
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Secure webhook system with join request verification',
    timestamp: new Date().toISOString(),
    status: 'active'
  });
}