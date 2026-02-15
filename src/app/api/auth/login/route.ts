import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signSession, getSessionCookieHeader } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email și parola sunt obligatorii' },
        { status: 400 }
      );
    }

    await connectDB();
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (!admin) {
      return NextResponse.json({ error: 'Date de autentificare invalide' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return NextResponse.json({ error: 'Date de autentificare invalide' }, { status: 401 });
    }

    const token = signSession(admin.email);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Eroare server' }, { status: 500 });
  }
}
