import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = 'hotelapp_session';

// Rutas que un cliente (huésped) SÍ puede ver
const CLIENT_ALLOWED = ['/my-reservations', '/profile'];
// Rutas exclusivas de superadmin
const SUPERADMIN_ONLY = ['/admin'];
// Rutas internas (recepción + superadmin)
const STAFF_ONLY = ['/dashboard', '/rooms', '/clients', '/reservations'];

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);

  // No autenticado → login (salvo que ya esté en login)
  if (!role) {
    if (pathname === '/login') return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Autenticado entrando a /login o raíz → su panel
  if (pathname === '/login' || pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = role === 'cliente' ? '/my-reservations' : '/dashboard';
    return NextResponse.redirect(url);
  }

  // Cliente: solo /my-reservations y /profile
  if (role === 'cliente') {
    const allowed = CLIENT_ALLOWED.some((p) => pathname.startsWith(p));
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = '/my-reservations';
      return NextResponse.redirect(url);
    }
  }

  // Recepción: no puede entrar a /admin
  if (role === 'recepcion' && SUPERADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Staff (recepcion/superadmin) no debe caer en /my-reservations del cliente
  if (role !== 'cliente' && pathname.startsWith('/my-reservations')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard/:path*',
    '/rooms/:path*',
    '/clients/:path*',
    '/reservations/:path*',
    '/my-reservations/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
