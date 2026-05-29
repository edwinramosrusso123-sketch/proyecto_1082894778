import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { toggleUser } from '@/lib/dataService';
import { toggleUserSchema } from '@/lib/schemas';
import { ValidationError, ForbiddenError } from '@/lib/errors';

export const PATCH = withAuth(async ({ req, params, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = toggleUserSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  if (params.id === session.userId) throw new ForbiddenError('No puedes suspender tu propia cuenta');
  const user = await toggleUser({ id: session.userId, email: session.email, role: session.role }, params.id, parsed.data.is_active);
  return NextResponse.json({ user });
}, ['superadmin']);
