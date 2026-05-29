// Prueba de escritorio: ejercita cada función del plan vía la API HTTP.
// Cubre RF (requerimientos funcionales), RN (reglas de negocio) y CU (casos de uso).
import { makeClient } from './_db.mjs';

const BASE = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 3517}`;
const TAG = 'DESK' + Date.now().toString().slice(-6);

let pass = 0, fail = 0;
const fails = [];
function check(id, desc, cond) {
  if (cond) { pass++; console.log(`  ✓ [${id}] ${desc}`); }
  else { fail++; fails.push(`[${id}] ${desc}`); console.log(`  ✗ [${id}] ${desc}`); }
}

// ── fetch con cookie-jar por sesión ──
function makeSession() {
  let cookie = '';
  return async function req(path, opts = {}) {
    const res = await fetch(BASE + path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(opts.headers || {}) },
      redirect: 'manual',
    });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0] + (cookie && !sc.includes('hotelapp_session') ? '; ' + cookie : '');
    let body = null;
    try { body = await res.json(); } catch { /* */ }
    return { status: res.status, body };
  };
}

async function main() {
  console.log(`\n🏨 Prueba de escritorio HotelApp — ${BASE}\n`);

  // ════ AUTENTICACIÓN ════
  console.log('AUTENTICACIÓN');
  const admin = makeSession();
  let r = await admin('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@hotelapp.com', password: 'admin123' }) });
  check('CU-A1/RF-01', 'Login SuperAdmin correcto', r.status === 200);
  check('RF-02', 'SuperAdmin redirige a /dashboard', r.body?.redirectTo === '/dashboard');

  r = await admin('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@hotelapp.com', password: 'malo' }) });
  check('SEG', 'Login con contraseña incorrecta → 401', r.status === 401);

  const recep = makeSession();
  r = await recep('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'recepcion@hotelapp.com', password: 'recepcion123' }) });
  check('RF-01', 'Login Recepción correcto', r.status === 200);

  const cliente = makeSession();
  r = await cliente('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'carlos.garcia@example.com', password: 'cliente123' }) });
  check('RF-02', 'Cliente redirige a /my-reservations', r.body?.redirectTo === '/my-reservations');

  const anon = makeSession();
  r = await anon('/api/dashboard');
  check('SEG', 'Sin sesión → 401 en API protegida', r.status === 401);

  // ════ DASHBOARD ════
  console.log('\nDASHBOARD');
  r = await admin('/api/dashboard');
  check('CU-14/RF-11', 'Dashboard devuelve KPIs de habitaciones', r.status === 200 && typeof r.body?.data?.rooms?.disponible === 'number');
  check('RF-12', 'Dashboard incluye 7 días de ocupación', Array.isArray(r.body?.data?.weeklyOccupancy) && r.body.data.weeklyOccupancy.length === 7);
  r = await cliente('/api/dashboard');
  check('PERM', 'Cliente NO accede al dashboard → 403', r.status === 403);

  // ════ HABITACIONES ════
  console.log('\nHABITACIONES');
  r = await recep('/api/rooms');
  check('CU-01/RF-04', 'Recepción ve listado de habitaciones', r.status === 200 && Array.isArray(r.body?.rooms));
  r = await recep('/api/rooms?status=disponible');
  check('RF-04', 'Filtro por estado funciona', r.status === 200 && r.body.rooms.every((x) => x.status === 'disponible'));

  const roomNo = TAG.slice(-4);
  r = await admin('/api/rooms', { method: 'POST', body: JSON.stringify({ room_number: roomNo, type: 'doble', status: 'disponible', price_per_night: 150000, description: 'test' }) });
  check('CU-02/RF-03', 'SuperAdmin crea habitación', r.status === 201);
  const roomId = r.body?.room?.id;

  r = await admin('/api/rooms', { method: 'POST', body: JSON.stringify({ room_number: roomNo, type: 'simple', status: 'disponible', price_per_night: 100000 }) });
  check('RN-10', 'Número de habitación duplicado → 409', r.status === 409);

  r = await recep('/api/rooms', { method: 'POST', body: JSON.stringify({ room_number: TAG + 'X', type: 'simple', status: 'disponible', price_per_night: 100000 }) });
  check('PERM/RF-03', 'Recepción NO puede crear habitación → 403', r.status === 403);

  r = await recep(`/api/rooms/${roomId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'mantenimiento' }) });
  check('CU-05', 'Recepción cambia estado a mantenimiento', r.status === 200 && r.body?.room?.status === 'mantenimiento');
  await admin(`/api/rooms/${roomId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'disponible' }) });

  // ════ CLIENTES ════
  console.log('\nCLIENTES');
  const cEmail = `cli.${TAG}@desktest.local`;
  const cDoc = `${TAG}DOC`;
  r = await recep('/api/clients', { method: 'POST', body: JSON.stringify({ name: `Cliente ${TAG}`, email: cEmail, phone: '3001112233', identification_number: cDoc }) });
  check('CU-06/RF-05', 'Recepción registra cliente', r.status === 201);
  const clientId = r.body?.client?.id;

  r = await recep('/api/clients', { method: 'POST', body: JSON.stringify({ name: 'Dup', email: cEmail, identification_number: cDoc + '2' }) });
  check('RN-06', 'Cliente con email duplicado → 409', r.status === 409);
  r = await recep('/api/clients', { method: 'POST', body: JSON.stringify({ name: 'Dup', email: `otro.${TAG}@desktest.local`, identification_number: cDoc }) });
  check('RN-06', 'Cliente con documento duplicado → 409', r.status === 409);

  r = await recep(`/api/clients/search?q=${TAG}`);
  check('CU-07/RF-13', 'Búsqueda de cliente por documento', r.status === 200 && r.body.clients.some((c) => c.id === clientId));

  // ════ RESERVAS ════
  console.log('\nRESERVAS');
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const iso = (d) => { const x = new Date(today); x.setUTCDate(x.getUTCDate() + d); return x.toISOString().slice(0, 10); };

  r = await recep(`/api/rooms/available?checkIn=${iso(20)}&checkOut=${iso(23)}`);
  check('RF-07', 'Habitaciones disponibles por fechas', r.status === 200 && r.body.rooms.some((x) => x.id === roomId));

  r = await recep('/api/reservations', { method: 'POST', body: JSON.stringify({ room_id: roomId, client_id: clientId, check_in: iso(20), check_out: iso(23) }) });
  check('CU-10/RF-07', 'Recepción crea reserva', r.status === 201);
  const resId = r.body?.reservation?.id;
  check('RN-07', 'Snapshot de precio guardado (150000)', Number(r.body?.reservation?.price_per_night_snapshot) === 150000);
  check('RN-08', 'Total calculado = 3 noches × 150000', Number(r.body?.reservation?.total_amount) === 450000);

  r = await admin(`/api/rooms/${roomId}`);
  check('RN-03/RF-08', 'Habitación pasa a "ocupada" al reservar', r.body?.room?.status === 'ocupada');

  // Solapamiento — la habitación ya está ocupada, así que falla por RN-02; probamos solapamiento real cancelando estado:
  r = await recep('/api/reservations', { method: 'POST', body: JSON.stringify({ room_id: roomId, client_id: clientId, check_in: iso(21), check_out: iso(24) }) });
  check('RN-01/RN-02', 'Reserva solapada/ocupada → 409', r.status === 409);

  // Snapshot inmutable: cambio el precio de la habitación y verifico que la reserva conserva el original
  await admin(`/api/rooms/${roomId}`, { method: 'PUT', body: JSON.stringify({ price_per_night: 999000 }) });
  r = await admin(`/api/reservations/${resId}`);
  check('RN-07', 'Snapshot inmutable tras cambiar precio de la habitación', Number(r.body?.reservation?.price_per_night_snapshot) === 150000);

  // Delete habitación con reserva activa → 409
  r = await admin(`/api/rooms/${roomId}`, { method: 'DELETE' });
  check('RN-05', 'No se elimina habitación con reserva activa → 409', r.status === 409);

  // Cancelar reserva → habitación disponible
  r = await recep(`/api/reservations/${resId}/cancel`, { method: 'POST' });
  check('CU-13/RF-09', 'Recepción cancela reserva', r.status === 200);
  r = await admin(`/api/rooms/${roomId}`);
  check('RN-04', 'Habitación vuelve a "disponible" al cancelar', r.body?.room?.status === 'disponible');

  // ════ PORTAL DEL CLIENTE (RN-09) ════
  console.log('\nPORTAL DEL CLIENTE');
  r = await cliente('/api/reservations/my');
  check('CU-12/RF-10', 'Cliente ve sus propias reservas', r.status === 200 && Array.isArray(r.body?.reservations));
  const allOwn = r.body.reservations.every((x) => x.client?.email === 'carlos.garcia@example.com');
  check('RN-09/RNF-02', 'Cliente solo ve reservas propias', allOwn);

  r = await cliente('/api/rooms');
  check('PERM', 'Cliente NO accede a /api/rooms → 403', r.status === 403);
  r = await cliente(`/api/reservations/${resId}/cancel`, { method: 'POST' });
  check('RS-03', 'Cliente NO puede cancelar reservas → 403', r.status === 403);

  // ════ USUARIOS (SuperAdmin) ════
  console.log('\nUSUARIOS');
  r = await admin('/api/users', { method: 'POST', body: JSON.stringify({ name: `User ${TAG}`, email: `user.${TAG}@desktest.local`, role: 'recepcion' }) });
  check('RF-14/6.4', 'SuperAdmin crea usuario con contraseña temporal', r.status === 201 && typeof r.body?.tempPassword === 'string' && r.body.tempPassword.length >= 6);
  const newUserId = r.body?.user?.id;
  r = await recep('/api/users');
  check('PERM', 'Recepción NO lista usuarios → 403', r.status === 403);
  r = await admin(`/api/users/${newUserId}`, { method: 'PATCH', body: JSON.stringify({ is_active: false }) });
  check('RF-14', 'SuperAdmin suspende usuario', r.status === 200 && r.body?.user?.is_active === false);

  // ════ AUDITORÍA ════
  console.log('\nAUDITORÍA');
  r = await admin('/api/audit');
  check('AUD', 'SuperAdmin ve la bitácora', r.status === 200 && Array.isArray(r.body?.entries) && r.body.entries.length > 0);
  check('AUD', 'Auditoría registró create_reservation', r.body.entries.some((e) => e.action === 'create_reservation'));
  check('AUD', 'Auditoría registró cancel_reservation', r.body.entries.some((e) => e.action === 'cancel_reservation'));
  r = await recep('/api/audit');
  check('PERM', 'Recepción NO ve auditoría → 403', r.status === 403);

  // ════ CAMBIO DE CONTRASEÑA ════
  console.log('\nCAMBIO DE CONTRASEÑA');
  r = await recep('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: 'malo', newPassword: 'nueva123' }) });
  check('CU-A3', 'Cambio con contraseña actual incorrecta → 401', r.status === 401);

  // ── Limpieza de datos de prueba ──
  console.log('\nLIMPIEZA');
  const db = makeClient();
  await db.connect();
  await db.query('DELETE FROM reservations WHERE id = $1', [resId]);
  await db.query('DELETE FROM rooms WHERE id = $1', [roomId]);
  await db.query('DELETE FROM clients WHERE id = $1', [clientId]);
  await db.query('DELETE FROM users WHERE id = $1', [newUserId]);
  await db.query(`DELETE FROM audit_log WHERE user_email LIKE '%@desktest.local' OR summary LIKE '%${TAG}%'`);
  await db.end();
  console.log('  ✓ datos de prueba eliminados');

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`RESULTADO: ${pass} passed, ${fail} failed`);
  if (fail) { console.log('\nFallos:'); fails.forEach((f) => console.log('  - ' + f)); process.exit(1); }
  console.log('✅ Todas las funciones del plan verificadas.');
}

main().catch((e) => { console.error('ERROR FATAL:', e); process.exit(1); });
