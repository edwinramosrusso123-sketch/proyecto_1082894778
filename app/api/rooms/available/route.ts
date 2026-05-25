import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');
const reservationsPath = path.join(process.cwd(), 'data', 'reservations.json');

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && aEnd > bStart;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkIn = url.searchParams.get('checkIn');
  const checkOut = url.searchParams.get('checkOut');

  const rawSeed = await fs.readFile(seedPath, 'utf8');
  const seed = JSON.parse(rawSeed);
  const rawRes = await fs.readFile(reservationsPath, 'utf8');
  const reservations = JSON.parse(rawRes || '[]');

  if (!checkIn || !checkOut) return NextResponse.json({ success: false, error: 'Faltan parámetros' }, { status: 400 });

  const available = seed.rooms.filter((r: any) => {
    if (r.status !== 'disponible') return false;
    const hasOverlap = reservations.some((res: any) => res.room_id === r.id && res.status === 'activa' && overlaps(res.check_in, res.check_out, checkIn, checkOut));
    return !hasOverlap;
  });

  return NextResponse.json({ success: true, rooms: available });
}
