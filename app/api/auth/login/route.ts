import { NextResponse } from 'next/server';
import { loginSchema } from '@/lib/schemas';
import { getUserByEmail, updateLastLogin, recordAudit } from '@/lib/dataService';
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { jsonError } from '@/lib/withAuth';
import { UnauthorizedError, ValidationError, ForbiddenError } from '@/lib/errors';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());

    const user = await getUserByEmail(parsed.data.email);
    if (!user) throw new UnauthorizedError('Correo o contraseña incorrectos');
    if (!user.is_active) throw new ForbiddenError('Tu cuenta está suspendida. Contacta al administrador.');

    const ok = await verifyPassword(parsed.data.password, user.password_hash);
    if (!ok) throw new UnauthorizedError('Correo o contraseña incorrectos');

    const token = await createSessionToken(user);
    await setSessionCookie(token);
    await updateLastLogin(user.id);
    await recordAudit({
      user_id: user.id, user_email: user.email, user_role: user.role,
      action: 'login', entity: 'system', summary: `${user.email} inició sesión`,
    });

    // 6.4: si tiene contraseña temporal, va primero a /profile a cambiarla
    const redirectTo = user.must_change_password
      ? '/profile'
      : user.role === 'cliente' ? '/my-reservations' : '/dashboard';
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.must_change_password },
      redirectTo,
    });
  } catch (err) {
    return jsonError(err);
  }
}
