import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getRoomById, updateRoom, deleteRoom, getReservations } from '@/lib/dataService';
import { updateRoomSchema } from '@/lib/schemas';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const GET = withAuth(async ({ params }) => {
  const room = await getRoomById(params.id);
  if (!room) throw new NotFoundError('Habitación no encontrada');
  const reservations = await getReservations({ roomId: params.id });
  return NextResponse.json({ room, reservations });
}, ['recepcion', 'superadmin']);

export const PUT = withAuth(async ({ req, params, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = updateRoomSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  const room = await updateRoom({ id: session.userId, email: session.email, role: session.role }, params.id, parsed.data);
  return NextResponse.json({ room });
}, ['superadmin']);

export const DELETE = withAuth(async ({ params, session }) => {
  await deleteRoom({ id: session.userId, email: session.email, role: session.role }, params.id);
  return NextResponse.json({ ok: true });
}, ['superadmin']);
