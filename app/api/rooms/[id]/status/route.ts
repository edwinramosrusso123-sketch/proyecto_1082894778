import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.json();
  const { status } = body;
  const raw = await fs.readFile(seedPath, 'utf8');
  const data = JSON.parse(raw);
  const room = data.rooms.find((r: any) => r.id === id);
  if (!room) return NextResponse.json({ success: false, error: 'Habitación no encontrada' }, { status: 404 });
  if (status === 'mantenimiento') {
    if (room.status !== 'disponible') {
      return NextResponse.json({ success: false, error: 'Solo se puede poner en mantenimiento una habitación disponible' }, { status: 409 });
    }
    room.status = 'mantenimiento';
    await fs.writeFile(seedPath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true, room });
  }
  room.status = status;
  await fs.writeFile(seedPath, JSON.stringify(data, null, 2), 'utf8');
  return NextResponse.json({ success: true, room });
}
