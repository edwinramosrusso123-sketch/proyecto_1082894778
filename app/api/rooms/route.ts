import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const seedPath = path.join(process.cwd(), 'data', 'seed.json');

export async function GET() {
  const raw = await fs.readFile(seedPath, 'utf8');
  const data = JSON.parse(raw);
  return NextResponse.json({ success: true, rooms: data.rooms });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { room_number, price_per_night } = body;
  const raw = await fs.readFile(seedPath, 'utf8');
  const data = JSON.parse(raw);
  if (data.rooms.find((r: any) => r.room_number === room_number)) {
    return NextResponse.json({ success: false, error: `Ya existe una habitación con el número ${room_number}.` }, { status: 409 });
  }
  const id = `r${Date.now()}`;
  const room = { id, room_number, status: 'disponible', price_per_night };
  data.rooms.push(room);
  await fs.writeFile(seedPath, JSON.stringify(data, null, 2), 'utf8');
  return NextResponse.json({ success: true, room });
}
