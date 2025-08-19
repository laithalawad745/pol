const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  try {
    // حذف المدير القديم إن وجد
    await prisma.admin.deleteMany({
      where: { username: 'admin' }
    })
    console.log('🗑️  Deleted old admin if existed')
    
    // تشفير كلمة المرور بشكل صحيح
    const hashedPassword = await bcrypt.hash('admin123', 12)
    console.log('🔐 Password hashed successfully')
    console.log('Hash preview:', hashedPassword.substring(0, 20) + '...')
    
    // إنشاء حساب المدير الجديد
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        channelId: '@your_channel',
        botToken: 'YOUR_BOT_TOKEN_HERE'
      }
    })
    
    console.log('✅ Admin created successfully!')
    console.log('📧 Username:', admin.username)
    console.log('🔑 Password: admin123')
    console.log('🆔 Admin ID:', admin.id)
    
    // التحقق من أن كلمة المرور تعمل
    const passwordValid = await bcrypt.compare('admin123', admin.password)
    if (passwordValid) {
      console.log('✅ Password verification: SUCCESS')
    } else {
      console.log('❌ Password verification: FAILED')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .then(() => {
    console.log('✨ Seed completed')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })