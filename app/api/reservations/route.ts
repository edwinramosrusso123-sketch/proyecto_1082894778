import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');
const reservationsPath = path.join(process.cwd(), 'data', 'reservations.json');
const auditPath = path.join(process.cwd(), 'data', 'audit.json');

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && aEnd > bStart;
}

function daysBetween(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  const diff = (db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(diff));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { room_id, check_in, check_out, guest_name, created_by } = body;

  // read files
  const seedRaw = await fs.readFile(seedPath, 'utf8');
  const seed = JSON.parse(seedRaw);
  const reservationsRaw = await fs.readFile(reservationsPath, 'utf8');
  const reservations = JSON.parse(reservationsRaw || '[]');

  const room = seed.rooms.find((r: any) => r.id === room_id);
  if (!room) return NextResponse.json({ success: false, error: 'Habitación no encontrada' }, { status: 404 });
  if (room.status !== 'disponible') return NextResponse.json({ success: false, error: 'La habitación no está disponible' }, { status: 409 });

  // availability check
  const conflict = reservations.some((res: any) => res.room_id === room_id && res.status === 'activa' && overlaps(res.check_in, res.check_out, check_in, check_out));
  if (conflict) return NextResponse.json({ success: false, error: `La habitación ${room.room_number} no está disponible del ${check_in} al ${check_out}.` }, { status: 409 });

  const nights = daysBetween(check_in, check_out);
  const price_per_night_snapshot = room.price_per_night;
  const total_amount = nights * price_per_night_snapshot;

  const id = `res${Date.now()}`;
  const reservation = { id, room_id, check_in, check_out, guest_name, nights, price_per_night_snapshot, total_amount, status: 'activa', created_by, created_at: new Date().toISOString() };

  // insert reservation
  reservations.push(reservation);
  // update room status
  room.status = 'ocupada';

  // write files (best-effort atomicity via sequence)
  await fs.writeFile(reservationsPath, JSON.stringify(reservations, null, 2), 'utf8');
  await fs.writeFile(seedPath, JSON.stringify(seed, null, 2), 'utf8');

  // audit
  const auditRaw = await fs.readFile(auditPath, 'utf8');
  const audit = JSON.parse(auditRaw || '[]');
  audit.push({ id: `a${Date.now()}`, action: 'create_reservation', reservation_id: id, by: created_by, at: new Date().toISOString() });
  await fs.writeFile(auditPath, JSON.stringify(audit, null, 2), 'utf8');

  return NextResponse.json({ success: true, reservation });
}
