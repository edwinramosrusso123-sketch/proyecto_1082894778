import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const reservationsPath = path.join(process.cwd(), 'data', 'reservations.json');
const seedPath = path.join(process.cwd(), 'data', 'seed.json');
const auditPath = path.join(process.cwd(), 'data', 'audit.json');

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.json();
  const { cancelled_by } = body;

  const reservationsRaw = await fs.readFile(reservationsPath, 'utf8');
  const reservations = JSON.parse(reservationsRaw || '[]');
  const reservation = reservations.find((r: any) => r.id === id);
  if (!reservation) return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 });
  if (reservation.status !== 'activa') return NextResponse.json({ success: false, error: 'Solo se pueden cancelar reservas activas.' }, { status: 409 });

  reservation.status = 'cancelada';
  reservation.cancelled_by = cancelled_by;
  reservation.cancelled_at = new Date().toISOString();

  // update room to disponible
  const seedRaw = await fs.readFile(seedPath, 'utf8');
  const seed = JSON.parse(seedRaw);
  const room = seed.rooms.find((r: any) => r.id === reservation.room_id);
  if (room) room.status = 'disponible';

  await fs.writeFile(reservationsPath, JSON.stringify(reservations, null, 2), 'utf8');
  await fs.writeFile(seedPath, JSON.stringify(seed, null, 2), 'utf8');

  // audit
  const auditRaw = await fs.readFile(auditPath, 'utf8');
  const audit = JSON.parse(auditRaw || '[]');
  audit.push({ id: `a${Date.now()}`, action: 'cancel_reservation', reservation_id: id, by: cancelled_by, at: new Date().toISOString() });
  await fs.writeFile(auditPath, JSON.stringify(audit, null, 2), 'utf8');

  return NextResponse.json({ success: true, reservation });
}
