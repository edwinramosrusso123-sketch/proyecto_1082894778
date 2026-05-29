import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getClients } from '@/lib/dataService';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? '';
  const clients = await getClients(q);
  return NextResponse.json({ clients: clients.slice(0, 10) });
}, ['recepcion', 'superadmin']);
