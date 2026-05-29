// Seed idempotente vía Supabase service role + bcryptjs.
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltan variables de Supabase'); process.exit(1); }
const supabase = createClient(url, key, { auth: { persistSession: false } });

const hash = (p) => bcrypt.hash(p, 10);
const isoOffset = (days) => {
  const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const nights = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);

const USERS = [
  { name: 'Super Administrador', email: 'admin@hotelapp.com', password: 'admin123', role: 'superadmin' },
  { name: 'Laura Recepción', email: 'recepcion@hotelapp.com', password: 'recepcion123', role: 'recepcion' },
];
const ROOMS = [
  { room_number: '101', type: 'simple', status: 'disponible', price_per_night: 120000, description: 'Habitación simple con vista interior y escritorio.' },
  { room_number: '102', type: 'simple', status: 'disponible', price_per_night: 120000, description: 'Habitación simple acogedora, cama individual.' },
  { room_number: '103', type: 'simple', status: 'mantenimiento', price_per_night: 130000, description: 'Simple en mantenimiento de pintura.' },
  { room_number: '201', type: 'doble', status: 'disponible', price_per_night: 200000, description: 'Doble con balcón y vista a la ciudad.' },
  { room_number: '202', type: 'doble', status: 'disponible', price_per_night: 210000, description: 'Doble amplia con sofá-cama.' },
  { room_number: '301', type: 'suite', status: 'disponible', price_per_night: 380000, description: 'Suite de lujo con jacuzzi y sala privada.' },
  { room_number: '302', type: 'suite', status: 'disponible', price_per_night: 420000, description: 'Suite presidencial con terraza panorámica.' },
];
const CLIENTS = [
  { name: 'Carlos García', email: 'carlos.garcia@example.com', phone: '3001234567', identification_number: 'CC1010101010', portalPassword: 'cliente123' },
  { name: 'María Fernanda López', email: 'maria.lopez@example.com', phone: '3009876543', identification_number: 'CC2020202020' },
  { name: 'Andrés Felipe Ruiz', email: 'andres.ruiz@example.com', phone: '3017654321', identification_number: 'CC3030303030' },
  { name: 'Diana Patricia Gómez', email: 'diana.gomez@example.com', phone: '3025556677', identification_number: 'CC4040404040' },
];

async function main() {
  let counts = { users: 0, rooms: 0, clients: 0, reservations: 0 };

  for (const u of USERS) {
    const { data: ex } = await supabase.from('users').select('id').eq('email', u.email).maybeSingle();
    if (ex) { console.log(`= usuario ${u.email}`); continue; }
    await supabase.from('users').insert({ name: u.name, email: u.email, password_hash: await hash(u.password), role: u.role });
    counts.users++; console.log(`+ usuario ${u.email}`);
  }
  const { data: admin } = await supabase.from('users').select('id').eq('email', 'admin@hotelapp.com').maybeSingle();
  const adminId = admin?.id ?? null;

  for (const r of ROOMS) {
    const { data: ex } = await supabase.from('rooms').select('id').eq('room_number', r.room_number).maybeSingle();
    if (ex) { console.log(`= habitación ${r.room_number}`); continue; }
    await supabase.from('rooms').insert(r);
    counts.rooms++; console.log(`+ habitación ${r.room_number}`);
  }

  for (const c of CLIENTS) {
    const { data: ex } = await supabase.from('clients').select('id').eq('identification_number', c.identification_number).maybeSingle();
    if (ex) { console.log(`= cliente ${c.name}`); continue; }
    let userId = null;
    if (c.portalPassword) {
      const { data: u } = await supabase.from('users').select('id').eq('email', c.email).maybeSingle();
      if (u) userId = u.id;
      else {
        const { data: created } = await supabase.from('users').insert({ name: c.name, email: c.email, password_hash: await hash(c.portalPassword), role: 'cliente' }).select('id').single();
        userId = created?.id ?? null; counts.users++;
      }
    }
    await supabase.from('clients').insert({ name: c.name, email: c.email, phone: c.phone, identification_number: c.identification_number, user_id: userId });
    counts.clients++; console.log(`+ cliente ${c.name}${userId ? ' (con portal)' : ''}`);
  }

  const { count: resCount } = await supabase.from('reservations').select('id', { count: 'exact', head: true });
  if ((resCount ?? 0) === 0) {
    const rooms = (await supabase.from('rooms').select('*')).data ?? [];
    const clients = (await supabase.from('clients').select('*')).data ?? [];
    const byNum = (n) => rooms.find((r) => r.room_number === n);
    const byDoc = (d) => clients.find((c) => c.identification_number === d);
    const plan = [
      { room: '201', doc: 'CC1010101010', check_in: isoOffset(-1), check_out: isoOffset(3), status: 'activa' },
      { room: '301', doc: 'CC2020202020', check_in: isoOffset(2), check_out: isoOffset(5), status: 'activa' },
      { room: '202', doc: 'CC3030303030', check_in: isoOffset(-10), check_out: isoOffset(-6), status: 'completada' },
      { room: '302', doc: 'CC4040404040', check_in: isoOffset(-3), check_out: isoOffset(-1), status: 'cancelada' },
    ];
    for (const p of plan) {
      const room = byNum(p.room); const client = byDoc(p.doc);
      if (!room || !client) continue;
      const n = nights(p.check_in, p.check_out); const price = Number(room.price_per_night);
      await supabase.from('reservations').insert({
        room_id: room.id, client_id: client.id, check_in: p.check_in, check_out: p.check_out,
        price_per_night_snapshot: price, total_amount: n * price, status: p.status, created_by: adminId,
        ...(p.status === 'cancelada' ? { cancelled_by: adminId, cancelled_at: new Date().toISOString() } : {}),
      });
      if (p.status === 'activa') await supabase.from('rooms').update({ status: 'ocupada' }).eq('id', room.id);
      counts.reservations++; console.log(`+ reserva Hab.${p.room} (${p.status})`);
    }
  } else console.log(`= reservas ya existen (${resCount})`);

  await supabase.from('audit_log').insert({
    user_id: adminId, user_email: 'admin@hotelapp.com', user_role: 'superadmin',
    action: 'bootstrap', entity: 'system',
    summary: `Seed aplicado: ${counts.users}u ${counts.rooms}h ${counts.clients}c ${counts.reservations}r`,
  });

  console.log('\nSeed completo:', counts);
  console.log('\nCredenciales:');
  console.log('  SuperAdmin: admin@hotelapp.com / admin123');
  console.log('  Recepción:  recepcion@hotelapp.com / recepcion123');
  console.log('  Cliente:    carlos.garcia@example.com / cliente123');
}

main().catch((e) => { console.error(e); process.exit(1); });
