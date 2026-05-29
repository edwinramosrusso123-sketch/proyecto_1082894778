import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getAvailableRooms } from '@/lib/dataService';
import { ValidationError } from '@/lib/errors';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');
  if (!checkIn || !checkOut || checkOut <= checkIn) {
    throw new ValidationError('Rango de fechas inválido');
  }
  const rooms = await getAvailableRooms(checkIn, checkOut);
  return NextResponse.json({ rooms });
}, ['recepcion', 'superadmin']);
