// lib/telegram-bot-manager.ts
import { Telegraf } from 'telegraf'
import { prisma } from './prisma'
import crypto from 'crypto'

class UnifiedBotManager {
  public bot: Telegraf | null = null  // public للوصول من الخارج
  private botUsername: string = ''
  
  // خريطة لربط كل قناة بالـ Admin الخاص بها
  private channelAdminMap: Map<string, string> = new Map() // channelId -> adminId
  
  // قائمة المستخدمين المتحققين لكل قناة
  private verifiedUsers: Map<string, Map<string, {
    subscriberId: string,
    expiresAt: Date
  }>> = new Map() // channelId -> userId -> data

  // Getter للحصول على username البوت
  public getBotUsername(): string {
    return this.botUsername || process.env.NEXT_PUBLIC_BOT_USERNAME || 'membermanagersss_bot'
  }

  constructor() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    // تعيين username البوت من البيئة
    this.botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'membermanagersss_bot'
    
    if (botToken && botToken !== 'YOUR_BOT_TOKEN_HERE') {
      try {
        this.bot = new Telegraf(botToken)
        this.setupHandlers()
        this.startBot()
        this.loadChannelMappings()
      } catch (error) {
        console.error('Error initializing bot:', error)
      }
    }
  }

  // تحميل جميع القنوات ومالكيها
  private async loadChannelMappings() {
    try {
      const admins = await prisma.admin.findMany({
        where: {
          channelId: { not: null },
          isActive: true
        }
      })

      this.channelAdminMap.clear()
      
      for (const admin of admins) {
        if (admin.channelId) {
          this.channelAdminMap.set(admin.channelId, admin.id)
          // إنشاء Map فارغة للمستخدمين المتحققين لهذه القناة
          if (!this.verifiedUsers.has(admin.channelId)) {
            this.verifiedUsers.set(admin.channelId, new Map())
          }
        }
      }

      console.log(`📢 Loaded ${this.channelAdminMap.size} channels`)
    } catch (error) {
      console.error('Error loading channel mappings:', error)
    }
  }

  private setupHandlers() {
    if (!this.bot) return

    // معالج أمر /start
    this.bot.command('start', async (ctx) => {
      const args = ctx.message.text.split(' ')
      
      if (args.length > 1) {
        const token = args[1]
        await this.handleInviteToken(ctx, token)
      } else {
        await ctx.reply(
          '🤖 مرحباً! أنا بوت إدارة الاشتراكات.\n\n' +
          '📌 استخدم الرابط الخاص بك للانضمام إلى القناة.\n' +
          '❓ للمساعدة، تواصل مع مسؤول قناتك.'
        )
      }
    })

    // معالج طلبات الانضمام لأي قناة
    this.bot.on('chat_join_request', async (ctx) => {
      const channelId = ctx.chat.id.toString()
      const userId = ctx.chatJoinRequest.from.id.toString()
      const username = ctx.chatJoinRequest.from.username || 'Unknown'
      
      console.log(`Join request in channel ${channelId} from user ${userId}`)
      
      // التحقق من أن هذه القناة مسجلة في النظام
      const adminId = this.channelAdminMap.get(channelId)
      if (!adminId) {
        console.log(`Channel ${channelId} not registered in system`)
        return // تجاهل القنوات غير المسجلة
      }

      // الحصول على قائمة المتحققين لهذه القناة
      const channelVerifiedUsers = this.verifiedUsers.get(channelId)
      if (!channelVerifiedUsers) {
        // رفض الطلب
        await ctx.telegram.declineChatJoinRequest(ctx.chat.id, ctx.chatJoinRequest.from.id)
        return
      }

      // التحقق من أن المستخدم متحقق منه لهذه القناة
      const verifiedData = channelVerifiedUsers.get(userId)
      
      if (verifiedData && new Date() < verifiedData.expiresAt) {
        // قبول الطلب
        try {
          await ctx.telegram.approveChatJoinRequest(
            ctx.chat.id,
            ctx.chatJoinRequest.from.id
          )
          
          console.log(`✅ Approved join request for ${userId} in channel ${channelId}`)
          
          // حذف من القائمة المؤقتة
          channelVerifiedUsers.delete(userId)
          
          // تسجيل الدخول
          await this.logAccess(verifiedData.subscriberId, 'joined_via_request')
          
        } catch (error) {
          console.error('Error approving request:', error)
        }
      } else {
        // رفض الطلب
        try {
          await ctx.telegram.declineChatJoinRequest(
            ctx.chat.id,
            ctx.chatJoinRequest.from.id
          )
          
          console.log(`❌ Declined join request for ${userId} in channel ${channelId}`)
          
          // إشعار المستخدم
          try {
            await this.bot!.telegram.sendMessage(
              userId,
              '❌ طلبك مرفوض!\n\n' +
              '📛 السبب: لست مشتركاً أو لم تتحقق من هويتك.\n' +
              '📞 تواصل مع مسؤول القناة.'
            )
          } catch (e) {}
        } catch (error) {
          console.error('Error declining request:', error)
        }
      }
    })

    // مراقبة الأعضاء الجدد في أي قناة
    this.bot.on('new_chat_members', async (ctx) => {
      const channelId = ctx.chat.id.toString()
      
      // التحقق من أن هذه القناة مسجلة في النظام
      const adminId = this.channelAdminMap.get(channelId)
      if (!adminId) return // تجاهل القنوات غير المسجلة
      
      for (const member of ctx.message.new_chat_members) {
        // تخطي البوت نفسه
        if (member.id === ctx.botInfo.id) continue
        
        const userId = member.id.toString()
        
        // التحقق من أن هذا المستخدم لديه اشتراك نشط في هذه القناة
        const subscriber = await prisma.subscriber.findFirst({
          where: {
            telegramId: userId,
            adminId: adminId,
            isActive: true,
            subscriptionEnd: { gt: new Date() }
          }
        })
        
        if (!subscriber) {
          console.log(`Kicking unauthorized member ${userId} from channel ${channelId}`)
          
          // طرد فوري
          try {
            await ctx.telegram.banChatMember(ctx.chat.id, member.id)
            
            setTimeout(async () => {
              await ctx.telegram.unbanChatMember(ctx.chat.id, member.id)
            }, 1000)
            
          } catch (error) {
            console.error('Error kicking:', error)
          }
        }
      }
    })
  }

  private async handleInviteToken(ctx: any, token: string) {
    try {
      const userId = ctx.from.id.toString()
      const username = ctx.from.username || 'none'
      const firstName = ctx.from.first_name || 'المستخدم'
      
      console.log(`User ${userId} using token: ${token}`)

      // البحث عن رابط الدعوة
      const inviteLink = await prisma.inviteLink.findUnique({
        where: { token },
        include: { 
          subscriber: {
            include: {
              admin: true
            }
          }
        }
      })

      if (!inviteLink) {
        await ctx.reply('❌ رابط غير صالح!')
        return
      }

      // التحقق من الاستخدام
      if (inviteLink.isUsed) {
        await ctx.reply('❌ تم استخدام هذا الرابط من قبل!')
        return
      }

      // التحقق من الصلاحية
      if (new Date() > inviteLink.expiresAt) {
        await ctx.reply('⏰ انتهت صلاحية الرابط!')
        return
      }

      // التحقق من الهوية
      if (userId !== inviteLink.subscriber.telegramId) {
        await ctx.reply(
          '🚫 هذا الرابط ليس لك!\n' 

        )
        return
      }

      // التحقق من الاشتراك
      if (new Date() > inviteLink.subscriber.subscriptionEnd) {
        await ctx.reply('❌ اشتراكك منتهي!')
        return
      }

      const channelId = inviteLink.subscriber.admin.channelId
      const channelName = inviteLink.subscriber.admin.channelName || 'القناة'

      if (!channelId) {
        await ctx.reply('❌ القناة غير محددة! تواصل مع المسؤول.')
        return
      }

      // إضافة المستخدم للقائمة المتحققة للقناة المحددة
      let channelVerifiedUsers = this.verifiedUsers.get(channelId)
      if (!channelVerifiedUsers) {
        channelVerifiedUsers = new Map()
        this.verifiedUsers.set(channelId, channelVerifiedUsers)
      }

      channelVerifiedUsers.set(userId, {
        subscriberId: inviteLink.subscriber.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 دقائق
      })

      // تحديث قاعدة البيانات
      await prisma.inviteLink.update({
        where: { id: inviteLink.id },
        data: {
          isUsed: true,
          usedAt: new Date()
        }
      })

      // محاولة الحصول على username القناة
      let channelUsername = ''
      let inviteChannelLink = ''
      
      try {
        const chat = await this.bot!.telegram.getChat(channelId)
        if ('username' in chat && chat.username) {
          channelUsername = chat.username
          inviteChannelLink = `https://t.me/${channelUsername}`
        }
      } catch (e) {
        console.log('Could not get channel username, trying invite link...')
      }

      // إذا لم نحصل على username، نحاول إنشاء رابط دعوة
      if (!inviteChannelLink) {
        try {
          // إنشاء رابط دعوة للقناة
          const chatInviteLink = await this.bot!.telegram.createChatInviteLink(channelId, {
            creates_join_request: true,
            name: `Join for ${firstName}`,
            expire_date: Math.floor(Date.now() / 1000) + 300 // 5 دقائق
          })
          inviteChannelLink = chatInviteLink.invite_link
        } catch (e) {
          console.error('Could not create invite link:', e)
        }
      }

      // إنشاء زر الانضمام
      let keyboard
      
      if (inviteChannelLink) {
        // لدينا رابط انضمام
        keyboard = {
          inline_keyboard: [
            [{
              text: `📢 انضم لقناة ${channelName}`,
              url: inviteChannelLink
            }],
            [{
              text: '✅ تحقق من حالة طلبي',
              callback_data: `check_${channelId}_${userId}`
            }]
          ]
        }
      } else {
        // لا يوجد رابط - نعرض معرف القناة
        keyboard = {
          inline_keyboard: [
            [{
              text: '✅ تحقق من حالة طلبي',
              callback_data: `check_${channelId}_${userId}`
            }]
          ]
        }
      }

      let message = `✅ تم التحقق من هويتك!\n\n` +
        `📢 القناة: ${channelName}\n` +
        `👤 ${inviteLink.subscriber.firstName || firstName}\n` +
        `📅 اشتراكك حتى: ${inviteLink.subscriber.subscriptionEnd.toLocaleDateString('ar-EG')}\n\n`

      if (inviteChannelLink) {
        message += `📌 خطوات الانضمام:\n` +
          `1️⃣ اضغط زر "انضم للقناة"\n` +
          `2️⃣ اضغط "إرسال طلب الانضمام"\n` +
          `3️⃣ انتظر ثواني... سيتم قبولك تلقائياً ✅\n\n` +
          `⏱ لديك 5 دقائق للانضمام`
      } else {
        message += `⚠️ لم نتمكن من إنشاء رابط الانضمام.\n` +
          `📞 تواصل مع المسؤول للحصول على رابط القناة.\n` +
          `معرف القناة: ${channelId}`
      }

      await ctx.reply(message, { reply_markup: keyboard })

    } catch (error) {
      console.error('Error:', error)
      await ctx.reply('❌ حدث خطأ. حاول مرة أخرى.')
    }
  }

  async sendInviteToSubscriber(subscriberId: string) {
    try {
      if (!this.bot) return false

      const subscriber = await prisma.subscriber.findUnique({
        where: { id: subscriberId },
        include: { admin: true }
      })

      if (!subscriber) return false

      // حذف الروابط القديمة
      await prisma.inviteLink.deleteMany({
        where: {
          subscriberId: subscriber.id,
          isUsed: false
        }
      })

      // إنشاء توكن جديد
      const token = crypto.randomBytes(32).toString('hex')
      
      await prisma.inviteLink.create({
        data: {
          token,
          link: '',
          subscriberId: subscriber.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })

      // التأكد من وجود username البوت
      let botUsername = this.botUsername
      
      // إذا لم يكن موجوداً، نحاول الحصول عليه
      if (!botUsername) {
        try {
          const botInfo = await this.bot.telegram.getMe()
          botUsername = botInfo.username || ''
          this.botUsername = botUsername
        } catch (e) {
          console.error('Could not get bot username:', e)
        }
      }
      
      // إذا لم نحصل عليه، نستخدم القيمة من البيئة
      if (!botUsername) {
        botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'membermanagersss_bot'
      }
      
      // التحقق النهائي من وجود username
      if (!botUsername || botUsername === '') {
        console.error('❌ Bot username is empty!')
        console.error('Please set NEXT_PUBLIC_BOT_USERNAME in .env.local')
        return false
      }
      
      const botLink = `https://t.me/${botUsername}?start=${token}`
      const channelName = subscriber.admin.channelName || 'القناة'
      
      await this.bot.telegram.sendMessage(
        subscriber.telegramId,
        `🎊 مرحباً ${subscriber.firstName || 'عزيزي المشترك'}!\n\n` +
        `✅ تم تفعيل اشتراكك في قناة: ${channelName}\n\n` +
        `📅 صالح من: ${new Date(subscriber.subscriptionStart).toLocaleDateString('ar-EG')}\n` +
        `📅 حتى: ${new Date(subscriber.subscriptionEnd).toLocaleDateString('ar-EG')}\n\n` +
        `🔐 للانضمام للقناة:\n` +
        `1️⃣ اضغط الزر أدناه\n` +
        `2️⃣ اضغط START في البوت\n` +
        `3️⃣ اتبع التعليمات\n\n` +
        `⚠️ الرابط خاص بك - لا تشاركه!`,
        {
          reply_markup: {
            inline_keyboard: [[
              { 
                text: '🚀 ابدأ الآن', 
                url: botLink 
              }
            ]]
          }
        }
      )

      console.log(`✅ Invite sent to ${subscriber.telegramId}`)
      console.log(`📢 Channel: ${subscriber.admin.channelId}`)
      console.log(`🤖 Bot: @${botUsername}`)
      console.log(`🔗 Link: ${botLink}`)
      
      return true
      
    } catch (error) {
      console.error('Error sending invite:', error)
      return false
    }
  }

  async kickExpiredSubscribers() {
    try {
      if (!this.bot) return

      // جلب جميع المشتركين المنتهية اشتراكاتهم من جميع القنوات
      const expiredSubscribers = await prisma.subscriber.findMany({
        where: {
          isActive: true,
          subscriptionEnd: { lt: new Date() }
        },
        include: { admin: true }
      })

      console.log(`Checking ${expiredSubscribers.length} expired subscriptions...`)

      for (const subscriber of expiredSubscribers) {
        if (!subscriber.admin.channelId) continue
        
        try {
          const telegramId = subscriber.telegramId
          
          if (!telegramId || isNaN(parseInt(telegramId))) {
            console.error(`Invalid Telegram ID: ${telegramId}`)
            continue
          }
          
          const numericId = parseInt(telegramId)
          
          // طرد من القناة المحددة
          await this.bot.telegram.banChatMember(
            subscriber.admin.channelId,
            numericId
          )
          
          setTimeout(async () => {
            try {
              await this.bot!.telegram.unbanChatMember(
                subscriber.admin.channelId!,
                numericId
              )
            } catch (e) {}
          }, 1000)

          // تحديث الحالة
          await prisma.subscriber.update({
            where: { id: subscriber.id },
            data: { isActive: false }
          })

          // إشعار المستخدم
          try {
            await this.bot.telegram.sendMessage(
              telegramId,
              `⏰ انتهى اشتراكك في قناة ${subscriber.admin.channelName || 'القناة'}!\n` +
              '❌ تم إزالتك من القناة.\n' +
              '📞 للتجديد تواصل مع المسؤول.'
            )
          } catch (e) {}

          console.log(`Kicked expired: ${telegramId} from channel ${subscriber.admin.channelId}`)
          
        } catch (error: any) {
          if (error.message?.includes('USER_NOT_PARTICIPANT')) {
            console.log('User already left the channel')
          } else {
            console.error(`Error kicking ${subscriber.id}:`, error.message)
          }
        }
      }
    } catch (error) {
      console.error('Error in kickExpiredSubscribers:', error)
    }
  }

  // إعادة تحميل القنوات عند إضافة قناة جديدة
  async reloadChannelMappings() {
    await this.loadChannelMappings()
  }

  private async logAccess(subscriberId: string, action: string) {
    try {
      const subscriber = await prisma.subscriber.findUnique({
        where: { id: subscriberId }
      })
      
      if (subscriber) {
        await prisma.accessLog.create({
          data: {
            action,
            telegramId: subscriber.telegramId,
            subscriberId: subscriber.id
          }
        })
      }
    } catch (error) {
      console.error('Error logging:', error)
    }
  }

  private async startBot() {
    if (!this.bot) return

    try {
      const botInfo = await this.bot.telegram.getMe()
      this.botUsername = botInfo.username || ''
      
      // إذا لم نحصل على username، نستخدم القيمة من البيئة
      if (!this.botUsername) {
        this.botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'membermanagersss_bot'
        console.log('⚠️ Using bot username from environment:', this.botUsername)
      }
      
      console.log(`🤖 Unified Bot @${this.botUsername} starting...`)
      console.log(`📱 Bot ID: ${botInfo.id}`)
      console.log(`🏷️ Bot Name: ${botInfo.first_name}`)
      
      // معالج callback buttons
      this.bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data
        
        if (data?.startsWith('check_')) {
          const parts = data.split('_')
          const channelId = parts[1]
          const userId = parts[2]
          
          const channelVerifiedUsers = this.verifiedUsers.get(channelId)
          const verified = channelVerifiedUsers?.get(userId)
          
          if (verified && new Date() < verified.expiresAt) {
            await ctx.answerCbQuery(
              '✅ أنت متحقق! أرسل طلب الانضمام الآن',
              { show_alert: true }
            )
          } else {
            await ctx.answerCbQuery(
              '❌ انتهت صلاحية التحقق. استخدم رابط جديد.',
              { show_alert: true }
            )
          }
        }
      })

      // بدء البوت
      this.bot.launch()

      // فحص دوري كل 30 ثانية
      setInterval(() => {
        this.kickExpiredSubscribers()
        this.reloadChannelMappings() // تحديث القنوات
      }, 30 * 1000)

      console.log('✅ Unified Bot is running!')
      console.log('🔐 Managing multiple channels with one bot')
      
    } catch (error) {
      console.error('Error starting bot:', error)
    }
  }

  stop() {
    if (this.bot) {
      this.bot.stop()
    }
  }
}

// مثيل واحد من البوت
let botInstance: UnifiedBotManager | null = null

export function initializeUnifiedBot() {
  if (!botInstance) {
    botInstance = new UnifiedBotManager()
  }
  return botInstance
}

export function getUnifiedBotInstance() {
  return botInstance
}

// تهيئة البوت عند بدء التطبيق
if (typeof window === 'undefined') {
  console.log('🚀 Initializing Unified Bot...')
  console.log('📱 Bot Username from ENV:', process.env.NEXT_PUBLIC_BOT_USERNAME)
  initializeUnifiedBot()
}