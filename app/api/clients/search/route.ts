import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const clientsPath = path.join(process.cwd(), 'data', 'clients.json');

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').toLowerCase();
  const raw = await fs.readFile(clientsPath, 'utf8');
  const clients = JSON.parse(raw || '[]');
  if (!q) return NextResponse.json({ success: true, results: clients.slice(0, 10) });
  const results = clients.filter((c: any) => (c.name || '').toLowerCase().includes(q) || (c.identification_number || '').toLowerCase().includes(q)).slice(0, 10);
  return NextResponse.json({ success: true, results });
}
