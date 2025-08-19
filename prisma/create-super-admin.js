// prisma/create-super-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creating Super Admin Account...')
  
  const username = 'superadmin' // غيّر هذا
  const password = 'Super@Admin123' // غيّر هذا لكلمة مرور قوية
  const email = 'admin@yoursite.com' // غيّر هذا
  
  try {
    // التحقق من وجود Super Admin
    const existing = await prisma.superAdmin.findUnique({
      where: { username }
    })
    
    if (existing) {
      console.log('⚠️  Super Admin already exists!')
      console.log('Username:', username)
      return
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // إنشاء الحساب
    const superAdmin = await prisma.superAdmin.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    })
    
    console.log('✅ Super Admin created successfully!')
    console.log('=====================================')
    console.log('📧 Username:', username)
    console.log('🔑 Password:', password)
    console.log('🌐 Login URL: http://localhost:3000/super-admin/login')
    console.log('=====================================')
    console.log('⚠️  IMPORTANT: Save these credentials securely!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
  .then(() => {
    console.log('✨ Done')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })