import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwt(token: string | undefined) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Only protect app routes (simple heuristic)
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/' ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  const payload = parseJwt(token);
  const role = payload?.role;

  if (role === 'cliente') {
    const allowed = ['/my-reservations', '/profile', '/api/reservations/my', '/api/auth/login'];
    if (!allowed.some(p => pathname === p || pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = '/my-reservations';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
