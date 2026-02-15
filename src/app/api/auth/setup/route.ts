import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { signSession, getSessionCookieHeader } from '@/lib/auth';

export async function GET() {
  try {
    await connectDB();
    const count = await Admin.countDocuments();
    return NextResponse.json({ needsSetup: count === 0 });
  } catch (err) {
    console.error('Setup check:', err);
    return NextResponse.json({ needsSetup: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const count = await Admin.countDocuments();
    if (count > 0) {
      return NextResponse.json({ error: 'Există deja un administrator' }, { status: 400 });
    }

    const body = await request.json();
    const { email, password } = body;
    const identifier = (email || body.username || '').toString().trim().toLowerCase();
    if (!identifier || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Email/nume utilizator și parolă (min. 6 caractere) sunt obligatorii' },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({
      email: identifier,
      password: hashed,
    });

    const admin = await Admin.findOne({ email: identifier });
    if (!admin) throw new Error('Admin not found after create');
    const token = signSession(admin.email);
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', getSessionCookieHeader(token));
    return response;
  } catch (err) {
    console.error('Setup error:', err);
    const message = err instanceof Error ? err.message : 'Eroare la crearea administratorului';
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Eroare la crearea administratorului' },
      { status: 500 }
    );
  }
}
