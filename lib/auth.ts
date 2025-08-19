// lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(id: string, role: string = 'admin') {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string, role: string }
  } catch {
    return null
  }
}

// للتحقق من Admin عادي
export async function getAdminFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  
  return prisma.admin.findUnique({
    where: { id: payload.id }
  })
}

// للتحقق من Super Admin
export async function verifySuperAdmin(request: NextRequest) {
  const token = request.cookies.get('super-admin-token')?.value
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'super_admin') return null
  
  return prisma.superAdmin.findUnique({
    where: { id: payload.id }
  })
}

// دالة مؤقتة للبوت
export function getBotInstance() {
  return null
}