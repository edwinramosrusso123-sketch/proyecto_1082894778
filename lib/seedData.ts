// Datos de ejemplo y función de seed idempotente (usa Supabase service role).
import { getSupabase } from './supabase';
import { hashPassword } from './auth';
import { calculateNights } from './dateUtils';
import type { Role, RoomType, RoomStatus } from './types';

export const SEED_USERS: { name: string; email: string; password: string; role: Role }[] = [
  { name: 'Super Administrador', email: 'admin@hotelapp.com', password: 'admin123', role: 'superadmin' },
  { name: 'Laura Recepción', email: 'recepcion@hotelapp.com', password: 'recepcion123', role: 'recepcion' },
];

export const SEED_ROOMS: { room_number: string; type: RoomType; status: RoomStatus; price_per_night: number; description: string }[] = [
  { room_number: '101', type: 'simple', status: 'disponible', price_per_night: 120000, description: 'Habitación simple con vista interior y escritorio.' },
  { room_number: '102', type: 'simple', status: 'disponible', price_per_night: 120000, description: 'Habitación simple acogedora, cama individual.' },
  { room_number: '103', type: 'simple', status: 'mantenimiento', price_per_night: 130000, description: 'Simple en mantenimiento de pintura.' },
  { room_number: '201', type: 'doble', status: 'disponible', price_per_night: 200000, description: 'Doble con balcón y vista a la ciudad.' },
  { room_number: '202', type: 'doble', status: 'disponible', price_per_night: 210000, description: 'Doble amplia con sofá-cama.' },
  { room_number: '301', type: 'suite', status: 'disponible', price_per_night: 380000, description: 'Suite de lujo con jacuzzi y sala privada.' },
  { room_number: '302', type: 'suite', status: 'disponible', price_per_night: 420000, description: 'Suite presidencial con terraza panorámica.' },
];

export const SEED_CLIENTS: { name: string; email: string; phone: string; identification_number: string; portal?: { password: string } }[] = [
  { name: 'Carlos García', email: 'carlos.garcia@example.com', phone: '3001234567', identification_number: 'CC1010101010', portal: { password: 'cliente123' } },
  { name: 'María Fernanda López', email: 'maria.lopez@example.com', phone: '3009876543', identification_number: 'CC2020202020' },
  { name: 'Andrés Felipe Ruiz', email: 'andres.ruiz@example.com', phone: '3017654321', identification_number: 'CC3030303030' },
  { name: 'Diana Patricia Gómez', email: 'diana.gomez@example.com', phone: '3025556677', identification_number: 'CC4040404040' },
];

function isoOffset(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type Log = (msg: string) => void;

export async function seedDatabase(log: Log = () => {}): Promise<{ users: number; rooms: number; clients: number; reservations: number }> {
  const supabase = getSupabase();
  const counts = { users: 0, rooms: 0, clients: 0, reservations: 0 };

  // ── Usuarios ──
  for (const u of SEED_USERS) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).maybeSingle();
    if (existing) { log(`= usuario ${u.email}`); continue; }
    const password_hash = await hashPassword(u.password);
    await supabase.from('users').insert({ name: u.name, email: u.email, password_hash, role: u.role });
    counts.users++; log(`+ usuario ${u.email}`);
  }
  const adminRes = await supabase.from('users').select('id').eq('email', 'admin@hotelapp.com').maybeSingle();
  const adminId: string | null = adminRes.data?.id ?? null;

  // ── Habitaciones ──
  for (const r of SEED_ROOMS) {
    const { data: existing } = await supabase.from('rooms').select('id').eq('room_number', r.room_number).maybeSingle();
    if (existing) { log(`= habitación ${r.room_number}`); continue; }
    await supabase.from('rooms').insert(r);
    counts.rooms++; log(`+ habitación ${r.room_number}`);
  }

  // ── Clientes (y portal opcional) ──
  for (const c of SEED_CLIENTS) {
    const { data: existing } = await supabase.from('clients').select('id').eq('identification_number', c.identification_number).maybeSingle();
    if (existing) { log(`= cliente ${c.name}`); continue; }
    let userId: string | null = null;
    if (c.portal) {
      const { data: u } = await supabase.from('users').select('id').eq('email', c.email).maybeSingle();
      if (u) { userId = u.id; }
      else {
        const password_hash = await hashPassword(c.portal.password);
        const { data: created } = await supabase.from('users').insert({
          name: c.name, email: c.email, password_hash, role: 'cliente',
        }).select('id').single();
        userId = created?.id ?? null;
        counts.users++;
      }
    }
    await supabase.from('clients').insert({
      name: c.name, email: c.email, phone: c.phone,
      identification_number: c.identification_number, user_id: userId,
    });
    counts.clients++; log(`+ cliente ${c.name}${userId ? ' (con portal)' : ''}`);
  }

  // ── Reservas de ejemplo ──
  const { count: resCount } = await supabase.from('reservations').select('id', { count: 'exact', head: true });
  if ((resCount ?? 0) === 0) {
    const rooms = (await supabase.from('rooms').select('*')).data ?? [];
    const clients = (await supabase.from('clients').select('*')).data ?? [];
    const byNumber = (n: string) => rooms.find((r: any) => r.room_number === n);
    const byDoc = (d: string) => clients.find((c: any) => c.identification_number === d);

    const plan = [
      // activa, en curso hoy → habitación ocupada
      { room: '201', doc: 'CC1010101010', check_in: isoOffset(-1), check_out: isoOffset(3), status: 'activa' },
      // activa futura
      { room: '301', doc: 'CC2020202020', check_in: isoOffset(2), check_out: isoOffset(5), status: 'activa' },
      // completada (pasada)
      { room: '202', doc: 'CC3030303030', check_in: isoOffset(-10), check_out: isoOffset(-6), status: 'completada' },
      // cancelada
      { room: '302', doc: 'CC4040404040', check_in: isoOffset(-3), check_out: isoOffset(-1), status: 'cancelada' },
    ];

    for (const p of plan) {
      const room = byNumber(p.room); const client = byDoc(p.doc);
      if (!room || !client) continue;
      const nights = calculateNights(p.check_in, p.check_out);
      const price = Number(room.price_per_night);
      await supabase.from('reservations').insert({
        room_id: room.id, client_id: client.id,
        check_in: p.check_in, check_out: p.check_out,
        price_per_night_snapshot: price, total_amount: nights * price,
        status: p.status, created_by: adminId,
        ...(p.status === 'cancelada' ? { cancelled_by: adminId, cancelled_at: new Date().toISOString() } : {}),
      });
      if (p.status === 'activa') {
        await supabase.from('rooms').update({ status: 'ocupada' }).eq('id', room.id);
      }
      counts.reservations++; log(`+ reserva Hab.${p.room} (${p.status})`);
    }
  } else {
    log(`= reservas ya existen (${resCount})`);
  }

  // Auditoría del bootstrap
  await supabase.from('audit_log').insert({
    user_id: adminId, user_email: 'admin@hotelapp.com', user_role: 'superadmin',
    action: 'bootstrap', entity: 'system',
    summary: `Seed aplicado: ${counts.users} usuarios, ${counts.rooms} habitaciones, ${counts.clients} clientes, ${counts.reservations} reservas`,
  });

  return counts;
}
