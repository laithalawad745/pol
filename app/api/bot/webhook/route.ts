// ===== .  app/api/bot/webhook/route.js =====

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bot from '@/lib/telegram-bot-manager';  // بدون امتداد

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const update = await request.json();
    console.log('📨 Webhook update:', JSON.stringify(update, null, 2));

    // معالجة طلبات الانضمام
    if (update.chat_join_request) {
      await handleJoinRequest(update.chat_join_request);
    }

    // معالجة انضمام أعضاء جدد (في حالة القنوات المفتوحة)
    if (update.message && update.message.new_chat_members) {
      await handleNewMembers(update.message);
    }

    // معالجة مغادرة الأعضاء
    if (update.message && update.message.left_chat_member) {
      await handleLeftMember(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('❌ خطأ في webhook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// معالجة طلبات الانضمام الجديدة
async function handleJoinRequest(joinRequest) {
  const chatId = joinRequest.chat.id.toString();
  const userId = joinRequest.from.id.toString();
  const inviteLink = joinRequest.invite_link;

  console.log(`📋 طلب انضمام من ${userId} للقناة ${chatId}`);

  try {
    // البحث عن العضو المصرح له
    const member = await prisma.member.findFirst({
      where: {
        telegramId: userId,
        channel: { telegramId: chatId },
        isActive: true,
        hasJoined: false
      },
      include: { channel: true }
    });

    if (member && member.inviteLink) {
      // التحقق من أن الرابط المستخدم هو نفس الرابط المرسل
      if (inviteLink && inviteLink.invite_link === member.inviteLink) {
        console.log(`✅ طلب مصرح من المستخدم الصحيح: ${userId}`);

        // قبول الطلب
        const approveResult = await bot.approveChatJoinRequest(chatId, userId);

        if (approveResult.success) {
          // تحديث حالة العضو
          await prisma.member.update({
            where: { id: member.id },
            data: { 
              hasJoined: true,
              inviteLink: null // حذف الرابط بعد الاستخدام
            }
          });

          // إلغاء الرابط نهائياً
          await bot.revokeInviteLink(chatId, member.inviteLink);

          // إرسال رسالة ترحيب
          await bot.sendMessage(userId, `
🎉 **مرحباً بك في ${member.channel.name}!**

✅ تم قبول طلب انضمامك
📅 عضويتك تنتهي في: ${new Date(member.kickDate).toLocaleString('ar-EG')}

استمتع بالمحتوى! 🚀
          `);

          console.log(`✅ تم قبول وتأكيد انضمام ${userId}`);
        }
      } else {
        // رابط مختلف أو محاولة احتيال
        console.log(`⚠️ محاولة استخدام رابط مختلف من ${userId}`);
        await rejectUnauthorizedRequest(chatId, userId);
      }
    } else {
      // مستخدم غير مصرح
      console.log(`❌ طلب غير مصرح من ${userId}`);
      await rejectUnauthorizedRequest(chatId, userId);
    }
  } catch (error) {
    console.error(`❌ خطأ في معالجة طلب الانضمام:`, error);
    // في حالة الخطأ، نرفض الطلب
    await bot.declineChatJoinRequest(chatId, userId);
  }
}

// رفض الطلبات غير المصرحة
async function rejectUnauthorizedRequest(chatId, userId) {
  try {
    // رفض الطلب
    await bot.declineChatJoinRequest(chatId, userId);

    // إرسال رسالة للمستخدم
    await bot.sendMessage(userId, `
❌ **طلب انضمام مرفوض**

لا تملك دعوة صالحة لهذه القناة.

💡 للحصول على دعوة، تواصل مع المشرف.
    `);

    console.log(`🚫 تم رفض طلب غير مصرح من ${userId}`);
  } catch (error) {
    console.error('خطأ في رفض الطلب:', error);
  }
}

// معالجة الأعضاء الجدد (للقنوات المفتوحة)
async function handleNewMembers(message) {
  const chatId = message.chat.id.toString();
  const newMembers = message.new_chat_members;

  for (const newMember of newMembers) {
    if (newMember.is_bot) continue;

    const userId = newMember.id.toString();
    console.log(`👤 عضو جديد انضم مباشرة: ${userId}`);

    const member = await prisma.member.findFirst({
      where: {
        telegramId: userId,
        channel: { telegramId: chatId },
        isActive: true
      }
    });

    if (!member) {
      // طرد فوري للأعضاء غير المصرحين
      setTimeout(async () => {
        await bot.kickChatMember(chatId, userId);
        await bot.sendMessage(userId, `
❌ **دخول غير مصرح**

تم إخراجك من القناة لأنك لا تملك دعوة صالحة.
        `);
      }, 2000);
    }
  }
}

// معالجة مغادرة الأعضاء
async function handleLeftMember(message) {
  const chatId = message.chat.id.toString();
  const leftMember = message.left_chat_member;
  
  if (leftMember.is_bot) return;

  const userId = leftMember.id.toString();
  console.log(`👋 العضو ${userId} غادر القناة ${chatId}`);

  // تحديث حالة العضو
  await prisma.member.updateMany({
    where: {
      telegramId: userId,
      channel: { telegramId: chatId }
    },
    data: {
      isActive: false,
      hasJoined: false
    }
  });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Secure webhook system with join request verification',
    timestamp: new Date().toISOString()
  });
}
