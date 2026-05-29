import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getMyReservations } from '@/lib/dataService';

// RN-09: el cliente solo ve sus propias reservas (filtra por su user_id)
export const GET = withAuth(async ({ session }) => {
  const reservations = await getMyReservations(session.userId);
  return NextResponse.json({ reservations });
}, ['cliente', 'recepcion', 'superadmin']);
