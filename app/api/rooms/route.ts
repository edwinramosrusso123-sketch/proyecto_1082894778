import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getRooms, createRoom } from '@/lib/dataService';
import { createRoomSchema } from '@/lib/schemas';
import { ValidationError } from '@/lib/errors';
import type { RoomStatus, RoomType } from '@/lib/types';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as RoomStatus | null;
  const type = url.searchParams.get('type') as RoomType | null;
  const rooms = await getRooms({ status: status ?? undefined, type: type ?? undefined });
  return NextResponse.json({ rooms });
}, ['recepcion', 'superadmin']);

export const POST = withAuth(async ({ req, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  const room = await createRoom(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data,
  );
  return NextResponse.json({ room }, { status: 201 });
}, ['superadmin']);
