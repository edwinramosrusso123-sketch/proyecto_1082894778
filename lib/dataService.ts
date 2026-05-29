// ════════════════════════════════════════════════════════════════
// dataService — ÚNICO punto de acceso a datos de la aplicación.
// Todas las rutas de API y páginas server pasan por aquí.
// Persistencia: Supabase Postgres (dominio + auditoría).
// ════════════════════════════════════════════════════════════════
import { getSupabase } from './supabase';
import { recordAudit, readAudit } from './audit';
import { hashPassword } from './auth';
import { calculateNights, calculateTotal, hasOverlap } from './reservationService';
import { ConflictError, NotFoundError } from './errors';
import { formatDateShort, todayISO, addDaysISO, rangeCoversDate } from './dateUtils';
import type {
  User, SafeUser, Room, Client, ClientWithReservations, Reservation,
  ReservationWithDetails, RoomFilters, ReservationFilters, Role,
  DashboardData, WeeklyOccupancy, AuditEntry, RoomStatus, RoomType,
} from './types';

type Actor = { id: string; email: string; role: Role };

function stripPassword(u: User): SafeUser {
  const { password_hash, ...rest } = u;
  return rest;
}

// ── Sistema ─────────────────────────────────────────────────
export async function getSystemMode(): Promise<'seed' | 'live'> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
    return error ? 'seed' : 'live';
  } catch {
    return 'seed';
  }
}

// ── Usuarios / Auth ─────────────────────────────────────────
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as User) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as User) ?? null;
}

export async function listUsers(): Promise<SafeUser[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as User[]).map(stripPassword);
}

export async function updateLastLogin(id: string): Promise<void> {
  const supabase = getSupabase();
  await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', id);
}

export async function createUser(
  actor: Actor | null,
  data: { name: string; email: string; role: Role; password: string; mustChangePassword?: boolean },
): Promise<User> {
  const supabase = getSupabase();
  const email = data.email.toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) throw new ConflictError('Ya existe un usuario con ese correo');
  const password_hash = await hashPassword(data.password);
  const { data: created, error } = await supabase.from('users').insert({
    name: data.name, email, password_hash, role: data.role,
    must_change_password: data.mustChangePassword ?? false,
  }).select().single();
  if (error) throw new ConflictError(error.message);
  if (actor) {
    await recordAudit({
      user_id: actor.id, user_email: actor.email, user_role: actor.role,
      action: 'create_user', entity: 'user', entity_id: created.id,
      summary: `Usuario ${data.name} (${data.role}) creado`,
    });
  }
  return created as User;
}

export async function toggleUser(actor: Actor, id: string, isActive: boolean): Promise<SafeUser> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').update({ is_active: isActive }).eq('id', id).select().single();
  if (error) throw new NotFoundError('Usuario no encontrado');
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'toggle_user', entity: 'user', entity_id: id,
    summary: `Usuario ${data.email} ${isActive ? 'activado' : 'suspendido'}`,
  });
  return stripPassword(data as User);
}

export async function changeUserPassword(actor: Actor, newHash: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from('users')
    .update({ password_hash: newHash, must_change_password: false }).eq('id', actor.id);
  if (error) throw new Error(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'change_password', entity: 'user', entity_id: actor.id,
    summary: `${actor.email} cambió su contraseña`,
  });
}

// ── Habitaciones ────────────────────────────────────────────
export async function getRooms(filters?: RoomFilters): Promise<Room[]> {
  const supabase = getSupabase();
  let q = supabase.from('rooms').select('*').order('room_number', { ascending: true });
  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.type) q = q.eq('type', filters.type);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as Room[]).map((r) => ({ ...r, price_per_night: Number(r.price_per_night) }));
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('rooms').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...(data as Room), price_per_night: Number((data as Room).price_per_night) };
}

export async function createRoom(actor: Actor, input: {
  room_number: string; type: RoomType; status: RoomStatus; price_per_night: number; description?: string | null;
}): Promise<Room> {
  const supabase = getSupabase();
  const dup = await supabase.from('rooms').select('id').eq('room_number', input.room_number).maybeSingle();
  if (dup.data) throw new ConflictError(`Ya existe la habitación ${input.room_number}`); // RN-10
  const { data, error } = await supabase.from('rooms').insert({
    room_number: input.room_number, type: input.type, status: input.status,
    price_per_night: input.price_per_night, description: input.description ?? null,
  }).select().single();
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'create_room', entity: 'room', entity_id: data.id,
    summary: `Habitación ${input.room_number} (${input.type}) creada`,
  });
  return { ...(data as Room), price_per_night: Number(data.price_per_night) };
}

export async function updateRoom(actor: Actor, id: string, input: Partial<{
  room_number: string; type: RoomType; status: RoomStatus; price_per_night: number; description: string | null;
}>): Promise<Room> {
  const supabase = getSupabase();
  const existing = await getRoomById(id);
  if (!existing) throw new NotFoundError('Habitación no encontrada');
  if (input.room_number && input.room_number !== existing.room_number) {
    const dup = await supabase.from('rooms').select('id').eq('room_number', input.room_number).maybeSingle();
    if (dup.data) throw new ConflictError(`Ya existe la habitación ${input.room_number}`);
  }
  const { data, error } = await supabase.from('rooms')
    .update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'update_room', entity: 'room', entity_id: id,
    summary: `Habitación ${data.room_number} actualizada`,
  });
  return { ...(data as Room), price_per_night: Number(data.price_per_night) };
}

export async function changeRoomStatus(actor: Actor, id: string, status: RoomStatus): Promise<Room> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('rooms')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw new NotFoundError('Habitación no encontrada');
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'change_room_status', entity: 'room', entity_id: id,
    summary: `Habitación ${data.room_number} → ${status}`,
  });
  return { ...(data as Room), price_per_night: Number(data.price_per_night) };
}

export async function deleteRoom(actor: Actor, id: string): Promise<void> {
  const supabase = getSupabase();
  const room = await getRoomById(id);
  if (!room) throw new NotFoundError('Habitación no encontrada');
  // RN-05: no eliminar si tiene reservas activas
  const { count } = await supabase.from('reservations')
    .select('id', { count: 'exact', head: true }).eq('room_id', id).eq('status', 'activa');
  if ((count ?? 0) > 0) throw new ConflictError('No se puede eliminar: la habitación tiene reservas activas');
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'delete_room', entity: 'room', entity_id: id,
    summary: `Habitación ${room.room_number} eliminada`,
  });
}

// Habitaciones disponibles para un rango de fechas (sin solapamiento y no en mantenimiento)
export async function getAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]> {
  const rooms = await getRooms();
  const result: Room[] = [];
  for (const room of rooms) {
    if (room.status === 'mantenimiento') continue;
    const overlap = await hasOverlap(room.id, checkIn, checkOut);
    if (!overlap) result.push(room);
  }
  return result;
}

// ── Clientes ────────────────────────────────────────────────
export async function getClients(query?: string): Promise<Client[]> {
  const supabase = getSupabase();
  let q = supabase.from('clients').select('*').order('created_at', { ascending: false });
  if (query && query.trim()) {
    const term = `%${query.trim()}%`;
    q = q.or(`name.ilike.${term},identification_number.ilike.${term},email.ilike.${term}`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data as Client[];
}

export async function getClientById(id: string): Promise<ClientWithReservations | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('clients').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const reservations = await getReservations({ clientId: id });
  return { ...(data as Client), reservations };
}

export async function getClientByUserId(userId: string): Promise<Client | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Client) ?? null;
}

export async function createClient(actor: Actor, input: {
  name: string; email: string; phone?: string | null; identification_number: string;
  create_portal_access?: boolean; portal_password?: string;
}): Promise<Client> {
  const supabase = getSupabase();
  const email = input.email.toLowerCase();
  // RN-06: email y documento únicos
  const dup = await supabase.from('clients').select('id, email, identification_number')
    .or(`email.eq.${email},identification_number.eq.${input.identification_number}`).maybeSingle();
  if (dup.data) {
    if (dup.data.email === email) throw new ConflictError('Ya existe un cliente con ese correo');
    throw new ConflictError('Ya existe un cliente con ese documento');
  }

  let userId: string | null = null;
  if (input.create_portal_access && input.portal_password) {
    const user = await createUser(actor, {
      name: input.name, email, role: 'cliente', password: input.portal_password, mustChangePassword: true,
    });
    userId = user.id;
  }

  const { data, error } = await supabase.from('clients').insert({
    name: input.name, email, phone: input.phone ?? null,
    identification_number: input.identification_number, user_id: userId,
  }).select().single();
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'create_client', entity: 'client', entity_id: data.id,
    summary: `Cliente ${input.name} registrado${userId ? ' con acceso al portal' : ''}`,
  });
  return data as Client;
}

export async function updateClient(actor: Actor, id: string, input: Partial<{
  name: string; email: string; phone: string | null; identification_number: string;
}>): Promise<Client> {
  const supabase = getSupabase();
  const patch: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
  if (input.email) patch.email = input.email.toLowerCase();
  const { data, error } = await supabase.from('clients').update(patch).eq('id', id).select().single();
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'update_client', entity: 'client', entity_id: id,
    summary: `Cliente ${data.name} actualizado`,
  });
  return data as Client;
}

export async function deleteClient(actor: Actor, id: string): Promise<void> {
  const supabase = getSupabase();
  const { count } = await supabase.from('reservations')
    .select('id', { count: 'exact', head: true }).eq('client_id', id).eq('status', 'activa');
  if ((count ?? 0) > 0) throw new ConflictError('No se puede eliminar: el cliente tiene reservas activas');
  const { data: client } = await supabase.from('clients').select('name').eq('id', id).maybeSingle();
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw new ConflictError(error.message);
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'delete_client', entity: 'client', entity_id: id,
    summary: `Cliente ${client?.name ?? id} eliminado`,
  });
}

// ── Reservas ────────────────────────────────────────────────
const RES_SELECT = `*,
  room:rooms!reservations_room_id_fkey(id, room_number, type),
  client:clients!reservations_client_id_fkey(id, name, email, identification_number)`;

function mapReservation(row: any): ReservationWithDetails {
  return {
    ...row,
    price_per_night_snapshot: Number(row.price_per_night_snapshot),
    total_amount: Number(row.total_amount),
    nights: calculateNights(row.check_in, row.check_out),
    room: row.room,
    client: row.client,
  };
}

export async function getReservations(filters?: ReservationFilters): Promise<ReservationWithDetails[]> {
  const supabase = getSupabase();
  let q = supabase.from('reservations').select(RES_SELECT).order('created_at', { ascending: false });
  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.roomId) q = q.eq('room_id', filters.roomId);
  if (filters?.clientId) q = q.eq('client_id', filters.clientId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapReservation);
}

export async function getReservationById(id: string): Promise<ReservationWithDetails | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('reservations').select(RES_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReservation(data) : null;
}

// Reservas del cliente autenticado (RN-09): filtra por su propio user_id
export async function getMyReservations(userId: string): Promise<ReservationWithDetails[]> {
  const client = await getClientByUserId(userId);
  if (!client) return [];
  return getReservations({ clientId: client.id });
}

// Operación crítica (sección 10.4 del plan)
export async function createReservation(actor: Actor, input: {
  room_id: string; client_id: string; check_in: string; check_out: string;
}): Promise<Reservation> {
  const supabase = getSupabase();

  // 1. Habitación existe y está disponible (RN-02)
  const room = await getRoomById(input.room_id);
  if (!room) throw new NotFoundError('Habitación no encontrada');
  if (room.status !== 'disponible') throw new ConflictError('La habitación no está disponible (ocupada o en mantenimiento)');

  // 2. Solapamiento de fechas (RN-01)
  const overlap = await hasOverlap(input.room_id, input.check_in, input.check_out);
  if (overlap) {
    throw new ConflictError(`La habitación ${room.room_number} ya tiene una reserva entre ${formatDateShort(input.check_in)} y ${formatDateShort(input.check_out)}`);
  }

  // 3. Cliente existe
  const { data: client } = await supabase.from('clients').select('id, name').eq('id', input.client_id).maybeSingle();
  if (!client) throw new NotFoundError('Cliente no encontrado');

  // 4. Snapshot de precio y total (RN-07, RN-08)
  const nights = calculateNights(input.check_in, input.check_out);
  const total = calculateTotal(nights, room.price_per_night);

  // 5. Crear reserva
  const { data, error } = await supabase.from('reservations').insert({
    room_id: input.room_id, client_id: input.client_id,
    check_in: input.check_in, check_out: input.check_out,
    price_per_night_snapshot: room.price_per_night, total_amount: total,
    status: 'activa', created_by: actor.id,
  }).select().single();
  if (error) throw new ConflictError(error.message);

  // 6. Cambiar estado de la habitación a 'ocupada' (RN-03)
  await supabase.from('rooms').update({ status: 'ocupada', updated_at: new Date().toISOString() }).eq('id', input.room_id);

  // 7. Auditoría
  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'create_reservation', entity: 'reservation', entity_id: data.id,
    summary: `Reserva Hab. ${room.room_number} (${formatDateShort(input.check_in)}–${formatDateShort(input.check_out)}) para ${client.name}`,
    metadata: { nights, total },
  });

  return { ...(data as Reservation), price_per_night_snapshot: Number(data.price_per_night_snapshot), total_amount: Number(data.total_amount) };
}

export async function cancelReservation(actor: Actor, id: string): Promise<Reservation> {
  const supabase = getSupabase();
  const reservation = await getReservationById(id);
  if (!reservation) throw new NotFoundError('Reserva no encontrada');
  if (reservation.status === 'cancelada') throw new ConflictError('La reserva ya está cancelada');

  const { data, error } = await supabase.from('reservations').update({
    status: 'cancelada', cancelled_by: actor.id, cancelled_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) throw new ConflictError(error.message);

  // RN-04: liberar la habitación → 'disponible'
  await supabase.from('rooms').update({ status: 'disponible', updated_at: new Date().toISOString() }).eq('id', reservation.room_id);

  await recordAudit({
    user_id: actor.id, user_email: actor.email, user_role: actor.role,
    action: 'cancel_reservation', entity: 'reservation', entity_id: id,
    summary: `Reserva Hab. ${reservation.room.room_number} cancelada (cliente ${reservation.client.name})`,
  });
  return data as Reservation;
}

// ── Dashboard ───────────────────────────────────────────────
export async function getDashboardData(): Promise<DashboardData> {
  const rooms = await getRooms();
  const total = rooms.length;
  const disponible = rooms.filter((r) => r.status === 'disponible').length;
  const ocupada = rooms.filter((r) => r.status === 'ocupada').length;
  const mantenimiento = rooms.filter((r) => r.status === 'mantenimiento').length;

  const today = todayISO();
  const allActive = await getReservations({ status: 'activa' });
  const reservationsToday = allActive.filter((r) => rangeCoversDate(r.check_in, r.check_out, today)).length;

  const weeklyOccupancy = buildWeeklyOccupancy(allActive, total);
  const recent = await getReservations();

  return {
    rooms: { total, disponible, ocupada, mantenimiento },
    reservationsToday,
    activeReservations: allActive.length,
    weeklyOccupancy,
    recentReservations: recent.slice(0, 6),
  };
}

function buildWeeklyOccupancy(active: ReservationWithDetails[], totalRooms: number): WeeklyOccupancy[] {
  const days: WeeklyOccupancy[] = [];
  const start = addDaysISO(todayISO(), -6);
  for (let i = 0; i < 7; i++) {
    const date = addDaysISO(start, i);
    const occupied = active.filter((r) => rangeCoversDate(r.check_in, r.check_out, date)).length;
    const label = new Date(date + 'T00:00:00Z').toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' });
    days.push({
      date, label,
      occupancy: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
      occupied, total: totalRooms,
    });
  }
  return days;
}

export async function getWeeklyOccupancy(): Promise<WeeklyOccupancy[]> {
  const rooms = await getRooms();
  const active = await getReservations({ status: 'activa' });
  return buildWeeklyOccupancy(active, rooms.length);
}

// ── Auditoría ───────────────────────────────────────────────
export async function getAudit(limit?: number): Promise<AuditEntry[]> {
  return readAudit(limit);
}
export { recordAudit };
