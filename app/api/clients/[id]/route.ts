import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { getClientById, updateClient, deleteClient } from '@/lib/dataService';
import { updateClientSchema } from '@/lib/schemas';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const GET = withAuth(async ({ params }) => {
  const client = await getClientById(params.id);
  if (!client) throw new NotFoundError('Cliente no encontrado');
  return NextResponse.json({ client });
}, ['recepcion', 'superadmin']);

export const PUT = withAuth(async ({ req, params, session }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Datos inválidos', parsed.error.flatten());
  const client = await updateClient({ id: session.userId, email: session.email, role: session.role }, params.id, parsed.data);
  return NextResponse.json({ client });
}, ['recepcion', 'superadmin']);

export const DELETE = withAuth(async ({ params, session }) => {
  await deleteClient({ id: session.userId, email: session.email, role: session.role }, params.id);
  return NextResponse.json({ ok: true });
}, ['superadmin']);
