// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}

// إضافة GET method أيضاً في حالة احتجناه
export async function GET() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('auth-token')
  return response
}