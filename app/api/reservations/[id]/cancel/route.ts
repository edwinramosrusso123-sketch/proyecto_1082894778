import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { cancelReservation } from '@/lib/dataService';

// RS-03: el cliente NO puede cancelar. Solo recepción y superadmin.
export const POST = withAuth(async ({ params, session }) => {
  const reservation = await cancelReservation(
    { id: session.userId, email: session.email, role: session.role },
    params.id,
  );
  return NextResponse.json({ reservation });
}, ['recepcion', 'superadmin']);
