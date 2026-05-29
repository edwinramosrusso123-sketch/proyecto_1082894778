import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getReservationById, getClientByUserId } from '@/lib/dataService';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

export const GET = withAuth(async ({ params, session }) => {
  const reservation = await getReservationById(params.id);
  if (!reservation) throw new NotFoundError('Reserva no encontrada');
  // RN-09: un cliente solo puede ver su propia reserva
  if (session.role === 'cliente') {
    const client = await getClientByUserId(session.userId);
    if (!client || reservation.client_id !== client.id) throw new ForbiddenError();
  }
  return NextResponse.json({ reservation });
});
