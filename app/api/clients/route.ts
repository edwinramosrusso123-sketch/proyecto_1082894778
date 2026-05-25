import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const clientsPath = path.join(process.cwd(), 'data', 'clients.json');
const seedPath = path.join(process.cwd(), 'data', 'seed.json');

export async function GET() {
  const raw = await fs.readFile(clientsPath, 'utf8');
  const clients = JSON.parse(raw || '[]');
  return NextResponse.json({ success: true, clients });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, identification_number, create_user } = body;
  const raw = await fs.readFile(clientsPath, 'utf8');
  const clients = JSON.parse(raw || '[]');
  if (clients.find((c: any) => c.email === email)) {
    return NextResponse.json({ success: false, error: 'Ya existe un cliente con ese correo.' }, { status: 409 });
  }
  if (clients.find((c: any) => c.identification_number === identification_number)) {
    return NextResponse.json({ success: false, error: 'Ya existe un cliente con ese número de documento.' }, { status: 409 });
  }

  const id = `c${Date.now()}`;
  const client: any = { id, name, email, identification_number, user_id: null };
  clients.push(client);
  await fs.writeFile(clientsPath, JSON.stringify(clients, null, 2), 'utf8');

  if (create_user) {
    const seedRaw = await fs.readFile(seedPath, 'utf8');
    const seed = JSON.parse(seedRaw);
    const userId = `u${Date.now()}`;
    const tempPassword = Math.random().toString(36).slice(-8);
    const user = { id: userId, email, role: 'cliente', name, password: tempPassword, must_change_password: true };
    seed.users.push(user);
    await fs.writeFile(seedPath, JSON.stringify(seed, null, 2), 'utf8');
    client.user_id = userId;
    // update clients file with user_id
    await fs.writeFile(clientsPath, JSON.stringify(clients, null, 2), 'utf8');
    return NextResponse.json({ success: true, client, user_credentials: { email, password: tempPassword } });
  }

  return NextResponse.json({ success: true, client });
}
