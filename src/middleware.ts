import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/admin')) return NextResponse.next();
  if (path === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('admin_session')?.value;
  if (!token || token.length < 10) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/products/:path*'],
};
