// middleware.ts (في المجلد الرئيسي)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // حماية Super Admin
  if (path.startsWith('/super-admin') && !path.includes('/login')) {
    const superAdminToken = request.cookies.get('super-admin-token')
    if (!superAdminToken) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url))
    }
  }
  
  // حماية Admin Dashboard
  if (path.startsWith('/dashboard')) {
    const adminToken = request.cookies.get('auth-token')
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // إذا كان مسجل دخول كـ Super Admin وحاول دخول صفحة Login
  if (path === '/super-admin/login') {
    const superAdminToken = request.cookies.get('super-admin-token')
    if (superAdminToken) {
      return NextResponse.redirect(new URL('/super-admin', request.url))
    }
  }
  
  // إذا كان مسجل دخول كـ Admin وحاول دخول صفحة Login
  if (path === '/login') {
    const adminToken = request.cookies.get('auth-token')
    if (adminToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/super-admin/:path*',
    '/login',
  ]
}