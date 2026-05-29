import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { changeRoomStatus } from '@/lib/dataService';
import { changeRoomStatusSchema } from '@/lib/schemas';
import { ValidationError } from '@/lib/errors';

export const PATCH = withAuth(async ({ req, params, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = changeRoomStatusSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  const room = await changeRoomStatus(
    { id: session.userId, email: session.email, role: session.role },
    params.id, parsed.data.status,
  );
  return NextResponse.json({ room });
}, ['recepcion', 'superadmin']);
