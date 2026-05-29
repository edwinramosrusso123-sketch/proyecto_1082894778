import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getReservations, createReservation } from '@/lib/dataService';
import { createReservationSchema } from '@/lib/schemas';
import { ValidationError } from '@/lib/errors';
import type { ReservationStatus } from '@/lib/types';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') as ReservationStatus | null;
  const roomId = url.searchParams.get('roomId');
  const clientId = url.searchParams.get('clientId');
  const reservations = await getReservations({
    status: status ?? undefined,
    roomId: roomId ?? undefined,
    clientId: clientId ?? undefined,
  });
  return NextResponse.json({ reservations });
}, ['recepcion', 'superadmin']);

export const POST = withAuth(async ({ req, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = createReservationSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  const reservation = await createReservation(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data,
  );
  return NextResponse.json({ reservation }, { status: 201 });
}, ['recepcion', 'superadmin']);
