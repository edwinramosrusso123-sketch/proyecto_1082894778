import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { changePasswordSchema } from '@/lib/schemas';
import { ValidationError, UnauthorizedError } from '@/lib/errors';
import { getUserById, changeUserPassword } from '@/lib/dataService';
import { verifyPassword, hashPassword } from '@/lib/auth';

export const POST = withAuth(async ({ session, req }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());

  const user = await getUserById(session.userId);
  if (!user) throw new UnauthorizedError();
  const ok = await verifyPassword(parsed.data.currentPassword, user.password_hash);
  if (!ok) throw new UnauthorizedError('La contraseña actual es incorrecta');

  const newHash = await hashPassword(parsed.data.newPassword);
  await changeUserPassword({ id: session.userId, email: session.email, role: session.role }, newHash);
  return NextResponse.json({ ok: true });
});
