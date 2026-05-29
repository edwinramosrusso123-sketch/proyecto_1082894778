import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { listUsers, createUser } from '@/lib/dataService';
import { createUserSchema } from '@/lib/schemas';
import { ValidationError } from '@/lib/errors';

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let p = '';
  for (let i = 0; i < 8; i++) p += chars[Math.floor(Math.random() * chars.length)];
  return p;
}

export const GET = withAuth(async () => {
  const users = await listUsers();
  return NextResponse.json({ users });
}, ['superadmin']);

export const POST = withAuth(async ({ req, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  // RF 6.4: genera contraseña temporal, must_change_password=true, se retorna una sola vez
  const tempPassword = generateTempPassword();
  const user = await createUser(
    { id: session.userId, email: session.email, role: session.role },
    { ...parsed.data, password: tempPassword, mustChangePassword: true },
  );
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    tempPassword,
  }, { status: 201 });
}, ['superadmin']);
