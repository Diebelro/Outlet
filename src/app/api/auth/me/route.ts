import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ admin: null }, { status: 200 });
  }
  return NextResponse.json({ admin: { email: session.email } });
}
