import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ ok: true, mongo: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Eroare conexiune';
    console.error('Health check:', err);
    return NextResponse.json(
      { ok: false, mongo: false, error: message },
      { status: 503 }
    );
  }
}
