import { NextResponse } from 'next/server';
import { getDeleteCookieHeader } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', getDeleteCookieHeader());
  return response;
}
