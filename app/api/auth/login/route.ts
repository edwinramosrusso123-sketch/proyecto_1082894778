import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import seed from '@/data/seed.json';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = (seed as any).users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    const res = NextResponse.json({ success: true, token });
    // Set cookie for server-side auth (middleware reads cookie)
    const cookieOptions = [`token=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax'];
    if (process.env.NODE_ENV === 'production') cookieOptions.push('Secure');
    // expires in 8 hours
    const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toUTCString();
    cookieOptions.push(`Expires=${expires}`);
    res.headers.set('Set-Cookie', cookieOptions.join('; '));
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error en servidor' }, { status: 500 });
  }
}
