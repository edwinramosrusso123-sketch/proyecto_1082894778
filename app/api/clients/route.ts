import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getClients, createClient } from '@/lib/dataService';
import { createClientSchema } from '@/lib/schemas';
import { ValidationError } from '@/lib/errors';

export const GET = withAuth(async ({ req }) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') ?? undefined;
  const clients = await getClients(q);
  return NextResponse.json({ clients });
}, ['recepcion', 'superadmin']);

export const POST = withAuth(async ({ req, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  if (parsed.data.create_portal_access && !parsed.data.portal_password) {
    throw new ValidationError('Para dar acceso al portal debes definir una contraseña');
  }
  const client = await createClient(
    { id: session.userId, email: session.email, role: session.role },
    parsed.data,
  );
  return NextResponse.json({ client }, { status: 201 });
}, ['recepcion', 'superadmin']);
