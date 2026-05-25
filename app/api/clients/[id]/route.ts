import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const clientsPath = path.join(process.cwd(), 'data', 'clients.json');

function parseJwt(token: string | undefined) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const raw = await fs.readFile(clientsPath, 'utf8');
  const clients = JSON.parse(raw || '[]');
  const client = clients.find((c: any) => c.id === id);
  if (!client) return NextResponse.json({ success: false, error: 'No encontrado' }, { status: 404 });

  // RN-09: si el requester es role='cliente', validar user_id
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || undefined;
  const payload = parseJwt(token);
  if (payload?.role === 'cliente') {
    if (client.user_id !== payload.sub) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }
  }

  return NextResponse.json({ success: true, client });
}
