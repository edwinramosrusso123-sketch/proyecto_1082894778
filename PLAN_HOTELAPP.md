# HotelApp — Plan Maestro del Sistema
> Sistema de Gestión Hotelera | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Edwin Ramos | Doc: 1082894778

---

## Nota sobre el stack

El plan de implementación original describe un backend Express separado con PostgreSQL local y deploy en Render/Railway. Este plan unifica todo bajo el **stack estándar del curso**: Next.js App Router (que actúa como servidor a través de API Routes), Supabase Postgres (base de datos en la nube), Vercel Blob (auditoría) y Vercel (deploy). Esta arquitectura elimina la necesidad de mantener dos proyectos distintos y simplifica el deploy a un solo servicio.

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Actores del sistema](#2-actores-del-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Casos de uso](#4-casos-de-uso)
5. [Requerimientos funcionales](#5-requerimientos-funcionales)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Stack tecnológico](#7-stack-tecnológico)
8. [Arquitectura de persistencia](#8-arquitectura-de-persistencia)
9. [Bootstrap y migrations](#9-bootstrap-y-migrations)
10. [Capa de datos unificada (dataService)](#10-capa-de-datos-unificada)
11. [Modelo de datos — Supabase Postgres](#11-modelo-de-datos--supabase-postgres)
12. [Auditoría en Vercel Blob](#12-auditoría-en-vercel-blob)
13. [Arquitectura de rutas](#13-arquitectura-de-rutas)
14. [Requerimientos no funcionales](#14-requerimientos-no-funcionales)
15. [Flujos de usuario y de trabajo](#15-flujos-de-usuario-y-de-trabajo)
16. [Diseño de interfaz](#16-diseño-de-interfaz)
17. [Plan de fases de implementación](#17-plan-de-fases-de-implementación)
18. [Estrategia de seguridad](#18-estrategia-de-seguridad)
19. [Restricciones del sistema](#19-restricciones-del-sistema)
20. [Glosario](#20-glosario)

---

## 1. Definición del sistema

**HotelApp** es una plataforma web de gestión hotelera que centraliza la administración de habitaciones, clientes y reservas. Incluye un dashboard con métricas de ocupación y un portal de autoservicio donde los huéspedes registrados pueden consultar sus propias reservas.

El sistema distingue tres tipos de usuario: el SuperAdmin con acceso total, el personal de Recepción que gestiona el día a día, y el Cliente (huésped) que solo puede ver su propia información.

---

## 2. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **SuperAdmin** | Interno | Control total del sistema. Crea y elimina habitaciones, gestiona usuarios y accede a todos los reportes. |
| **Recepción** | Interno | Gestiona reservas y clientes. Puede ver habitaciones pero no eliminarlas. |
| **Cliente** | Externo | Huésped registrado. Solo puede ver sus propias reservas y sus datos personales. |
| **Sistema** | No humano | Cambia el estado de las habitaciones automáticamente al crear o cancelar reservas. Valida solapamiento de fechas. Registra auditoría. |

> No hay registro público. Los Clientes son creados por Recepción o SuperAdmin cuando llegan al hotel.

---

## 3. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Cliente | Recepción | SuperAdmin |
|---|:-:|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ | ✅ |
| Acceder a `/admin/db-setup` | ❌ | ❌ | ✅ |
| **HABITACIONES** | | | |
| Ver listado de habitaciones | ❌ | ✅ | ✅ |
| Crear / editar habitación | ❌ | ❌ | ✅ |
| Eliminar habitación | ❌ | ❌ | ✅ |
| Cambiar estado (disponible/mantenimiento) | ❌ | ✅ | ✅ |
| **CLIENTES** | | | |
| Ver sus propios datos | ✅ | ✅ | ✅ |
| Ver todos los clientes | ❌ | ✅ | ✅ |
| Crear / editar clientes | ❌ | ✅ | ✅ |
| Eliminar clientes | ❌ | ❌ | ✅ |
| **RESERVAS** | | | |
| Ver sus propias reservas | ✅ | ✅ | ✅ |
| Ver todas las reservas | ❌ | ✅ | ✅ |
| Crear reserva | ❌ | ✅ | ✅ |
| Cancelar reserva | ❌ | ✅ | ✅ |
| **DASHBOARD / REPORTES** | | | |
| Ver dashboard con métricas | ❌ | ✅ | ✅ |
| Ver estadísticas de ocupación | ❌ | ✅ | ✅ |
| **USUARIOS** | | | |
| Crear / editar / suspender usuarios | ❌ | ❌ | ✅ |
| **AUDITORÍA** | | | |
| Ver bitácora de operaciones | ❌ | ❌ | ✅ |

---

## 4. Casos de uso

### Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Iniciar sesión | Todos | Correo y contraseña. El sistema redirige al panel correspondiente al rol. |
| CU-A2 | Cerrar sesión | Todos | Elimina la cookie de sesión. |
| CU-A3 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Habitaciones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Ver habitaciones | Recepción / SuperAdmin | Listado con filtros por estado y tipo. Indica habitaciones disponibles, ocupadas y en mantenimiento. |
| CU-02 | Crear habitación | SuperAdmin | Número, tipo (simple/doble/suite), estado inicial y precio por noche. |
| CU-03 | Editar habitación | SuperAdmin | Modifica cualquier campo excepto el número si tiene reservas activas. |
| CU-04 | Eliminar habitación | SuperAdmin | Solo si no tiene reservas activas (pendientes o activas). |
| CU-05 | Cambiar estado a mantenimiento | Recepción / SuperAdmin | Marca la habitación como en mantenimiento manualmente. |

### Clientes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Registrar cliente | Recepción / SuperAdmin | Nombre, email, teléfono y número de documento. Email y documento únicos. |
| CU-07 | Buscar cliente | Recepción / SuperAdmin | Por nombre o número de documento. |
| CU-08 | Ver perfil de cliente | Cliente / Recepción / SuperAdmin | Datos del cliente y su historial completo de reservas. |
| CU-09 | Editar cliente | Recepción / SuperAdmin | Modifica cualquier campo. |

### Reservas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-10 | Crear reserva | Recepción / SuperAdmin | Selecciona cliente, habitación y fechas. El sistema valida disponibilidad. Si se crea con éxito, la habitación pasa a "ocupada". |
| CU-11 | Ver reservas | Recepción / SuperAdmin | Listado con filtros por estado (pendiente/activa/completada/cancelada), fecha y habitación. |
| CU-12 | Ver mis reservas | Cliente | El cliente autenticado ve solo sus propias reservas. |
| CU-13 | Cancelar reserva | Recepción / SuperAdmin | Cambia el estado a "cancelada" y libera la habitación (vuelve a "disponible"). |

### Dashboard

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-14 | Ver dashboard | Recepción / SuperAdmin | KPIs: habitaciones disponibles, ocupadas y en mantenimiento. Reservas activas de hoy. Gráfica de ocupación semanal. |

---

## 5. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite login con correo y contraseña para los tres roles. |
| RF-02 | El sistema redirige a cada usuario al panel correspondiente a su rol tras el login. |
| RF-03 | El SuperAdmin puede crear, editar y eliminar habitaciones con sus atributos completos. |
| RF-04 | El sistema muestra el listado de habitaciones con filtros por estado y tipo. |
| RF-05 | Recepción y SuperAdmin pueden crear, editar y buscar clientes. |
| RF-06 | El sistema impide duplicar clientes por email o documento. |
| RF-07 | El sistema permite crear reservas con validación de disponibilidad (sin solapamiento de fechas). |
| RF-08 | Al crear una reserva confirmada, la habitación cambia automáticamente a estado "ocupada". |
| RF-09 | Al cancelar una reserva, la habitación vuelve a estado "disponible". |
| RF-10 | El Cliente autenticado puede ver únicamente sus propias reservas y datos. |
| RF-11 | El dashboard muestra KPIs de ocupación y reservas del día. |
| RF-12 | El dashboard incluye una gráfica de ocupación de los últimos 7 días. |
| RF-13 | El sistema permite buscar clientes por nombre o documento y reservas por cliente o habitación. |
| RF-14 | El SuperAdmin gestiona usuarios (crear, editar, suspender). |

---

## 6. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | No puede existir más de una reserva activa para la misma habitación en fechas solapadas. | Query de verificación antes de insertar. Solapamiento: `check_in < req.check_out AND check_out > req.check_in`. |
| RN-02 | Una habitación en estado "ocupada" o "mantenimiento" no puede recibir nuevas reservas. | Verificar `rooms.status = 'disponible'` antes de crear la reserva. |
| RN-03 | Al confirmar una reserva, el sistema cambia automáticamente la habitación a "ocupada". | UPDATE rooms SET status='ocupada' dentro de la misma operación de creación de reserva. |
| RN-04 | Al cancelar una reserva activa, la habitación vuelve a "disponible". | UPDATE rooms SET status='disponible' dentro de la operación de cancelación. |
| RN-05 | Una habitación no puede eliminarse si tiene reservas en estado pendiente o activa. | Verificar COUNT antes de eliminar. Retornar 409 si > 0. |
| RN-06 | El email y el número de documento del cliente deben ser únicos en el sistema. | UNIQUE en `clients.email` y `clients.identification_number`. |
| RN-07 | El precio de la habitación se captura como snapshot en la reserva al momento de crearla. | Campo `price_per_night_snapshot` en `reservations`. |
| RN-08 | El total de la reserva se calcula automáticamente: `noches × precio_snapshot`. | `total = nights * price_per_night_snapshot` al crear la reserva. |
| RN-09 | El cliente solo puede ver sus propias reservas. Recepción y SuperAdmin pueden ver todas. | Verificar `reservations.client_id === userId` en el servidor para clientes. |
| RN-10 | El número de habitación debe ser único en el sistema. | UNIQUE en `rooms.room_number`. |

---

## 7. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Gráficas | Recharts | 2.x | Gráfica de ocupación semanal |
| Auditoría | `@vercel/blob` | — | Logs append-only |
| Iconos | Lucide React | — | Iconografía |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 8. Arquitectura de persistencia

### 8.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, habitaciones, clientes, reservas. | Todo el dominio hotelero requiere SQL: validación de solapamiento, filtros de disponibilidad, estadísticas de ocupación. |
| **Vercel Blob** | Auditoría de operaciones (`audit/<YYYYMM>.json`). | Logs append-only sin necesidad de SQL. |
| **`data/` en el repo** | Seed inicial: SuperAdmin + habitaciones demo. | Read-only. Solo para arrancar antes del bootstrap. |

### 8.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **La verificación de solapamiento y la creación de la reserva son una secuencia atómica en el servidor.** El cliente nunca controla las fechas de disponibilidad.
3. **El cambio de estado de la habitación ocurre dentro de la misma operación que crea o cancela la reserva.** Nunca separados.
4. **`price_per_night_snapshot` en la reserva** preserva el precio al momento de reservar — si el precio cambia después, el historial no se altera.
5. **CERO caché** en `/api/:path*`. Headers `no-store`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "HotelApp" }
  seed.json       ← {
                      "users": [{
                        email: "admin@hotelapp.com",
                        password_hash: "<bcrypt admin123>",
                        name: "Super Administrador",
                        role: "superadmin"
                      }],
                      "rooms": [
                        { "room_number": "101", "type": "simple", "status": "disponible", "price_per_night": 120000 },
                        { "room_number": "102", "type": "simple", "status": "disponible", "price_per_night": 120000 },
                        { "room_number": "201", "type": "doble",  "status": "disponible", "price_per_night": 200000 },
                        { "room_number": "301", "type": "suite",  "status": "disponible", "price_per_night": 380000 }
                      ]
                    }
  README.md
```

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql          ← Fase 1: users + _migrations
  0002_init_rooms.sql          ← Fase 3: rooms
  0003_init_clients.sql        ← Fase 4: clients
  0004_init_reservations.sql   ← Fase 5: reservations
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 10.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 10.2 Estructura interna de `lib/`

```
lib/
  dataService.ts         ← ÚNICO punto de acceso
  supabase.ts            ← Solo lo importa dataService
  blobAudit.ts           ← Solo lo importa dataService
  pgMigrate.ts           ← Solo lo importa /api/system/bootstrap
  seedReader.ts          ← Solo lo importa dataService en modo seed
  reservationService.ts  ← checkAvailability, calculateNights, calculateTotal
  dashboardService.ts    ← buildOccupancyStats, getWeeklyOccupancy
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 10.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Habitaciones
export async function getRooms(filters?: RoomFilters): Promise<Room[]>
export async function getRoomById(id: string): Promise<Room | null>
export async function createRoom(userId: string, data: CreateRoomRequest): Promise<Room>
export async function updateRoom(id: string, userId: string, data: UpdateRoomRequest): Promise<Room>
export async function deleteRoom(id: string, userId: string): Promise<void>
export async function getAvailableRooms(checkIn: string, checkOut: string): Promise<Room[]>

// Clientes
export async function getClients(query?: string): Promise<Client[]>
export async function getClientById(id: string): Promise<ClientWithReservations | null>
export async function createClient(userId: string, data: CreateClientRequest): Promise<Client>
export async function updateClient(id: string, userId: string, data: UpdateClientRequest): Promise<Client>
export async function deleteClient(id: string, userId: string): Promise<void>

// Reservas
export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation>
export async function getReservations(filters?: ReservationFilters): Promise<ReservationWithDetails[]>
export async function getMyReservations(clientUserId: string): Promise<ReservationWithDetails[]>
export async function cancelReservation(id: string, userId: string): Promise<Reservation>

// Dashboard
export async function getDashboardData(): Promise<DashboardData>
export async function getWeeklyOccupancy(): Promise<WeeklyOccupancy[]>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 10.4 Lógica crítica: `createReservation`

```typescript
// lib/reservationService.ts
export async function createReservation(userId: string, data: CreateReservationRequest): Promise<Reservation> {
  const { roomId, clientId, checkIn, checkOut } = data;

  // 1. Verificar que la habitación existe y está disponible (RN-02)
  const room = await getRoomById(roomId);
  if (!room || room.status !== 'disponible') {
    throw new ConflictError('La habitación no está disponible');
  }

  // 2. Verificar solapamiento de fechas (RN-01)
  const hasOverlap = await checkAvailability(roomId, checkIn, checkOut);
  if (hasOverlap) {
    throw new ConflictError('La habitación ya tiene una reserva en esas fechas');
  }

  // 3. Calcular precio y total con snapshot (RN-07, RN-08)
  const nights = calculateNights(checkIn, checkOut);
  const total = nights * room.price_per_night;

  // 4. Crear la reserva con snapshot de precio
  const reservation = await supabase.from('reservations').insert({
    room_id: roomId,
    client_id: clientId,
    check_in: checkIn,
    check_out: checkOut,
    price_per_night_snapshot: room.price_per_night,
    total_amount: total,
    status: 'activa',
    created_by: userId,
  }).select().single();

  // 5. Cambiar estado de la habitación a 'ocupada' (RN-03)
  await supabase.from('rooms').update({ status: 'ocupada' }).eq('id', roomId);

  // 6. Auditoría
  await recordAudit({ action: 'create_reservation', ... });

  return reservation.data;
}
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(120) NOT NULL,
  email                VARCHAR(120) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL DEFAULT 'cliente'
                       CHECK (role IN ('superadmin', 'recepcion', 'cliente')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_rooms.sql`

```sql
CREATE TABLE IF NOT EXISTS rooms (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number    VARCHAR(10)   NOT NULL UNIQUE,       -- RN-10
  type           VARCHAR(10)   NOT NULL
                 CHECK (type IN ('simple', 'doble', 'suite')),
  status         VARCHAR(15)   NOT NULL DEFAULT 'disponible'
                 CHECK (status IN ('disponible', 'ocupada', 'mantenimiento')),
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  description    TEXT,
  created_at     TIMESTAMPTZ   DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type   ON rooms(type);
```

### Migration `0003_init_clients.sql`

```sql
-- El cliente puede tener un usuario en el sistema (user_id) o no
-- Si tiene user_id, puede hacer login y ver sus reservas (rol 'cliente')
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID         REFERENCES users(id) ON DELETE SET NULL,
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(120) UNIQUE NOT NULL,         -- RN-06
  phone                 VARCHAR(20),
  identification_number VARCHAR(30)  UNIQUE NOT NULL,         -- RN-06
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_id_number ON clients(identification_number);
```

> **Relación users ↔ clients:** Un cliente del hotel puede o no tener cuenta de usuario. Si Recepción crea un usuario con role='cliente' para un huésped, ese user_id se vincula al registro de client. Esto permite al huésped iniciar sesión y ver sus reservas (RN-09).

### Migration `0004_init_reservations.sql`

```sql
CREATE TABLE IF NOT EXISTS reservations (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id               UUID          NOT NULL REFERENCES rooms(id),
  client_id             UUID          NOT NULL REFERENCES clients(id),
  check_in              DATE          NOT NULL,
  check_out             DATE          NOT NULL,
  price_per_night_snapshot DECIMAL(10,2) NOT NULL,  -- RN-07: snapshot del precio
  total_amount          DECIMAL(12,2) NOT NULL,      -- RN-08: calculado al crear
  status                VARCHAR(15)   NOT NULL DEFAULT 'activa'
                        CHECK (status IN ('activa', 'completada', 'cancelada')),
  created_by            UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by          UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ   DEFAULT NOW(),
  CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_res_room_dates ON reservations(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_res_client     ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_res_status     ON reservations(status);
```

**Query de verificación de solapamiento (RN-01):**

```sql
-- Verifica si hay reservas activas solapadas para una habitación
SELECT COUNT(*) FROM reservations
WHERE room_id = $1
  AND status = 'activa'
  AND check_in < $3    -- $3 = check_out solicitado
  AND check_out > $2;  -- $2 = check_in solicitado
-- Si COUNT > 0: hay solapamiento, rechazar la reserva.
```

---

## 12. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'superadmin' | 'recepcion' | 'cliente';
  action:
    | 'login' | 'logout'
    | 'create_room' | 'update_room' | 'delete_room' | 'change_room_status'
    | 'create_client' | 'update_client' | 'delete_client'
    | 'create_reservation' | 'cancel_reservation'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'room' | 'client' | 'reservation' | 'user' | 'system';
  entity_id?: string;
  summary: string;  // "Reserva Hab. 201 (15/06–18/06) creada para Carlos García"
  metadata?: Record<string, unknown>;
};
```

---

## 13. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                         ← Redirige a /dashboard o /login
  login/page.tsx                   ← Sin link de registro
  dashboard/page.tsx               ← KPIs + gráfica de ocupación (Recepción/SuperAdmin)
  rooms/
    page.tsx                       ← Listado con filtros
    new/page.tsx                   ← Crear habitación (SuperAdmin)
    [id]/page.tsx                  ← Detalle + reservas de esa habitación
    [id]/edit/page.tsx             ← Editar (SuperAdmin)
  clients/
    page.tsx                       ← Listado + búsqueda
    new/page.tsx                   ← Registrar cliente
    [id]/page.tsx                  ← Perfil con historial de reservas
    [id]/edit/page.tsx             ← Editar cliente
  reservations/
    page.tsx                       ← Listado con filtros (Recepción/SuperAdmin)
    new/page.tsx                   ← Nueva reserva
  my-reservations/page.tsx         ← Portal del cliente — solo sus reservas
  profile/page.tsx                 ← Datos propios + cambio de contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | me | change-password
    rooms/
      route.ts                     ← GET | POST (superadmin)
      [id]/route.ts                ← GET | PUT | DELETE (superadmin)
      [id]/status/route.ts         ← PATCH estado (recepcion + superadmin)
      available/route.ts           ← GET disponibles por fechas
    clients/
      route.ts                     ← GET | POST
      [id]/route.ts                ← GET | PUT | DELETE (superadmin)
      search/route.ts              ← GET búsqueda
    reservations/
      route.ts                     ← GET todas (recepcion/superadmin) | POST
      my/route.ts                  ← GET solo del cliente autenticado
      [id]/route.ts                ← GET detalle
      [id]/cancel/route.ts         ← POST cancelar
    dashboard/route.ts
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                          ← AppLayout, Sidebar (por rol), SeedModeBanner
  rooms/                           ← RoomCard, RoomStatusBadge, RoomForm
  clients/                         ← ClientCard, ClientSearchInput, ClientForm
  reservations/                    ← ReservationForm, ReservationCard, DateRangePicker
  dashboard/                       ← KpiCard, OccupancyChart, ReservationsToday
  admin/                           ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  reservationService.ts | dashboardService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 14. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La verificación de disponibilidad y creación de reserva deben completarse en menos de 1 segundo. |
| RNF-02 | El cliente autenticado nunca puede ver datos de otros clientes ni otras reservas. |
| RNF-03 | La interfaz debe funcionar correctamente en celulares y tablets. |
| RNF-04 | Las contraseñas deben hashearse con bcrypt. |
| RNF-05 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-06 | Los precios se muestran en formato COP (`$XXX.XXX`). |

---

## 15. Flujos de usuario y de trabajo

### Flujo de bootstrap

Login SuperAdmin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live. El bootstrap inserta las 4 habitaciones demo.

### Flujo de nueva reserva

| Paso | Actor | Acción |
|---|---|---|
| 1 | Recepción | Va a /reservations/new. |
| 2 | Recepción | Busca y selecciona el cliente por nombre o documento. Si no existe, lo crea. |
| 3 | Recepción | Selecciona la habitación. El sistema muestra solo las disponibles para las fechas elegidas. |
| 4 | Recepción | Elige las fechas de entrada y salida. El sistema calcula automáticamente el número de noches y el total. |
| 5 | Recepción | Confirma. El servidor verifica disponibilidad, crea la reserva con el snapshot del precio y cambia la habitación a "ocupada". |

### Flujo del portal del cliente

| Paso | Actor | Acción |
|---|---|---|
| 1 | Cliente | Inicia sesión con las credenciales que le entregó Recepción. |
| 2 | Sistema | Detecta role='cliente' → redirige a /my-reservations. |
| 3 | Cliente | Ve sus reservas activas, completadas y canceladas. |
| 4 | Cliente | Puede ir a /profile para ver sus datos y cambiar su contraseña. |
| 5 | Cliente | Intenta navegar a /rooms → el middleware lo redirige a /my-reservations. |

---

## 16. Diseño de interfaz

### Identidad visual del Login

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla dividida: mitad izquierda con imagen/gradiente de hotel, mitad derecha con formulario. |
| **Panel izquierdo** | Degradado oscuro azul-teal (`from-slate-800 to-teal-700`). Nombre "HotelApp" en blanco. Tagline "Gestión hotelera inteligente." Ícono de hotel estilizado. |
| **Panel derecho** | Fondo blanco, formulario centrado, max-w-sm. |
| **Logo** | SVG de un edificio de hotel con símbolo de llave, en teal (`#0D9488`), 48px. |
| **Nombre** | "HotelApp" en Inter Bold 28px, slate oscuro (`#0F172A`). |
| **Campos** | Borde gris, focus en teal (`#0D9488`). |
| **Botón** | bg `#0D9488`, texto blanco, hover `#0F766E`. |
| **Animación** | Framer Motion: panel derecho `opacity: 0→1`, `x: 20→0`, 0.4s. |

### Paleta de colores

| Elemento | Hex |
|---|---|
| Primario (teal) | `#0D9488` |
| Primario oscuro | `#0F766E` |
| Primario claro | `#CCFBF1` |
| Acento (slate) | `#0F172A` |
| Fondo principal | `#F8FAFC` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#0F172A` |
| Texto secundario | `#64748B` |
| **Disponible** | `#16A34A` + fondo `#F0FDF4` |
| **Ocupada** | `#DC2626` + fondo `#FEF2F2` |
| **Mantenimiento** | `#D97706` + fondo `#FFFBEB` |
| **Reserva activa** | `#0D9488` + fondo `#CCFBF1` |
| **Reserva completada** | `#6B7280` + fondo `#F9FAFB` |
| **Reserva cancelada** | `#DC2626` + fondo `#FEF2F2` |
| Bordes | `#E2E8F0` |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `RoomCard` | Tarjeta de habitación con número, tipo, badge de estado (verde/rojo/ámbar) y precio por noche. |
| `RoomStatusBadge` | Badge por color: Disponible (verde), Ocupada (rojo), Mantenimiento (ámbar). |
| `ClientSearchInput` | Campo con debounce de 300ms que busca en `/api/clients/search` y muestra dropdown de resultados. |
| `ReservationForm` | Formulario de nueva reserva: buscador de cliente, selector de habitación disponible (se filtra al cambiar fechas), DateRangePicker, resumen automático de noches y total. |
| `DateRangePicker` | Selector de rango de fechas con validación: check_in >= hoy, check_out > check_in. |
| `OccupancyChart` | Recharts BarChart con barras teal que muestran el porcentaje de ocupación por día de los últimos 7 días. |
| `KpiCard` | Tarjeta con ícono, label y número. Para las 4 KPIs del dashboard: disponibles, ocupadas, mantenimiento, reservas de hoy. |

### Sidebar por rol

| Rol | Ítems del sidebar |
|---|---|
| **SuperAdmin** | Dashboard, Habitaciones, Clientes, Reservas, Administración (Usuarios + Auditoría), Perfil |
| **Recepción** | Dashboard, Habitaciones, Clientes, Reservas, Perfil |
| **Cliente** | Mis Reservas, Perfil |

---

## 17. Plan de fases de implementación

### Fase 1 — Bootstrap, Login y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg recharts @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con SuperAdmin + 4 habitaciones demo. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | API Routes: bootstrap, diagnose, mode, login, logout, me, change-password. |
| 1.10 | Crear `app/login/page.tsx` con la identidad visual de HotelApp: layout dividido, panel teal a la izquierda, formulario a la derecha. Sin link de registro. |
| 1.11 | `npm run typecheck` sin errores. Probar: login SuperAdmin del seed → modo seed → cookie HttpOnly. |

---

### Fase 2 — Dashboard, Layout y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState, Table. |
| 2.2 | Configurar variables CSS de la paleta teal en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar dinámico según el rol. Cliente ve solo Mis Reservas + Perfil. |
| 2.4 | Crear `/admin/db-setup/page.tsx` con diagnóstico y bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `middleware.ts`: proteger rutas. El cliente solo puede acceder a `/my-reservations` y `/profile`. Redirect a `/my-reservations` si intenta ir a `/rooms` o `/reservations`. |
| 2.7 | Crear `GET /api/dashboard`: KPIs de habitaciones (disponibles, ocupadas, mantenimiento), reservas activas hoy, datos de ocupación de los últimos 7 días para el gráfico. |
| 2.8 | Crear `app/dashboard/page.tsx` (Recepción/SuperAdmin): 4 `KpiCard` + `OccupancyChart`. |
| 2.9 | Crear `app/my-reservations/page.tsx` (Cliente): listado de sus reservas. |
| 2.10 | Probar: login como SuperAdmin → dashboard; login como cliente → /my-reservations; intento del cliente de ir a /rooms → redirect. |

---

### Fase 3 — Gestión de Habitaciones
> Rol: Ingeniero Fullstack — CRUD de habitaciones con control de acceso

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_rooms.sql`. Aplicar desde `/admin/db-setup`. El bootstrap inserta las 4 habitaciones demo. |
| 3.2 | Agregar tipos `Room`, `CreateRoomRequest`, `UpdateRoomRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getRooms` (con filtros por status y type), `getRoomById`, `createRoom`, `updateRoom`, `deleteRoom` (verifica RN-05), `getAvailableRooms`. |
| 3.4 | API Routes: `GET/POST /api/rooms` (POST solo superadmin), `GET/PUT/DELETE /api/rooms/[id]` (PUT/DELETE solo superadmin), `PATCH /api/rooms/[id]/status` (recepcion + superadmin), `GET /api/rooms/available?checkIn=&checkOut=`. |
| 3.5 | Crear `app/rooms/page.tsx`: cuadrícula de `RoomCard` con filtros. El botón "Nueva habitación" solo aparece para SuperAdmin. |
| 3.6 | Crear `app/rooms/new/page.tsx` y `app/rooms/[id]/edit/page.tsx` (SuperAdmin). |
| 3.7 | Verificar RN-10: crear habitación con número duplicado → 409. |
| 3.8 | Verificar RN-05: el delete de una habitación con reservas activas retorna 409. |

---

### Fase 4 — Gestión de Clientes
> Rol: Ingeniero Fullstack — Registro de clientes y portal de huéspedes

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_clients.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Client`, `ClientWithReservations`, `CreateClientRequest` y schemas Zod (RN-06). |
| 4.3 | Extender `dataService`: `getClients`, `getClientById` (con sus reservas), `createClient`, `updateClient`, `deleteClient` (SuperAdmin), y `searchClients` (ILIKE por nombre o documento). |
| 4.4 | API Routes: `GET/POST /api/clients`, `GET /api/clients/search?q=`, `GET/PUT/DELETE /api/clients/[id]`. |
| 4.5 | Crear `app/clients/page.tsx`: listado con `ClientSearchInput` con debounce. |
| 4.6 | Crear `app/clients/[id]/page.tsx`: perfil del cliente con sus reservas (historial). |
| 4.7 | Implementar la creación de usuario vinculado al cliente: cuando Recepción crea un cliente y quiere darle acceso al portal, puede crear también un usuario con role='cliente' y vincular el `user_id` al cliente. Esto permite al huésped hacer login. |
| 4.8 | Verificar RN-06: crear dos clientes con el mismo email o documento → 409. |
| 4.9 | Verificar RN-09: el cliente autenticado solo puede ver su propio perfil (probar con la API directamente). |

---

### Fase 5 — Sistema de Reservas
> Rol: Ingeniero Fullstack Senior — Operación más crítica del sistema

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_reservations.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Crear `lib/reservationService.ts`: `checkAvailability`, `calculateNights`, operación completa de `createReservation` (secuencia de la sección 10.4). |
| 5.3 | Agregar tipos `Reservation`, `ReservationWithDetails`, `CreateReservationRequest` y schemas Zod. |
| 5.4 | Extender `dataService`: `createReservation` (secuencia completa: verificar habitación → verificar solapamiento → crear con snapshot → cambiar estado habitación), `getReservations`, `getMyReservations`, `cancelReservation` (cambia estado a 'cancelada' y libera la habitación). |
| 5.5 | API Routes: `GET/POST /api/reservations` (GET solo recepcion/superadmin), `GET /api/reservations/my` (cliente), `GET /api/reservations/[id]`, `POST /api/reservations/[id]/cancel`. |
| 5.6 | Crear `app/reservations/new/page.tsx`: `ReservationForm` con `ClientSearchInput` (debounce), `DateRangePicker`, selector de habitación disponible (llama a `/api/rooms/available` al cambiar las fechas), resumen de noches y total en tiempo real. |
| 5.7 | Crear `app/reservations/page.tsx` (Recepción/SuperAdmin): listado con filtros. |
| 5.8 | Conectar `app/my-reservations/page.tsx` con datos reales. |
| 5.9 | Verificar RN-01: intentar crear dos reservas para la misma habitación en fechas solapadas → 409. |
| 5.10 | Verificar RN-03: al crear reserva → habitación cambia a "ocupada" automáticamente. |
| 5.11 | Verificar RN-04: al cancelar reserva → habitación vuelve a "disponible". |
| 5.12 | Verificar RN-07: snapshot del precio — cambiar el precio de la habitación y verificar que las reservas anteriores conservan el precio original. |

---

### Fase 6 — Gráfica de Ocupación, Administración y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 6.1 | Instalar `recharts`. |
| 6.2 | Crear `lib/dashboardService.ts`: `getWeeklyOccupancy` calcula el porcentaje de ocupación por día de los últimos 7 días (habitaciones ocupadas / total habitaciones × 100). |
| 6.3 | Integrar `OccupancyChart` (Recharts BarChart) en el dashboard con datos reales. |
| 6.4 | Gestión de usuarios: POST genera contraseña temporal, `must_change_password=true`, retorna en claro una sola vez. Login → /profile si must_change_password. |
| 6.5 | Crear `app/admin/users/page.tsx` y `app/admin/audit/page.tsx`. |
| 6.6 | Empty states: dashboard sin reservas hoy, lista de habitaciones vacía, lista de clientes vacía, lista de reservas sin datos para los filtros, mis reservas sin reservas. |
| 6.7 | Manejo de errores: 401 (sesión expirada), 403 (sin permisos), 409 (solapamiento de reserva — mensaje descriptivo con las fechas del conflicto), 409 (habitación en mantenimiento/ocupada), 500. |
| 6.8 | Verificar el portal del cliente en producción: login como cliente → solo ve /my-reservations → intento de ir a /rooms → redirect. |
| 6.9 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 6.10 | Deploy en Vercel con todas las variables de entorno. |
| 6.11 | Probar en producción: SuperAdmin crea habitación → Recepción crea cliente y usuario → cliente hace login → ve sus reservas → Recepción crea reserva → habitación pasa a ocupada → Recepción cancela → habitación disponible → dashboard muestra ocupación actualizada. |

---

## 18. Estrategia de seguridad

### Flujo de login con redireccionamiento por rol

```
1. Validar body con Zod
2. getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active y bcrypt.compare()
4. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
5. Redirigir según rol:
   - superadmin → /dashboard
   - recepcion  → /dashboard
   - cliente    → /my-reservations
```

### Protección del portal del cliente (RN-09)

```typescript
// GET /api/reservations/my
// El endpoint llama getMyReservations(userId) que hace:
// SELECT * FROM reservations
//   JOIN clients ON clients.id = reservations.client_id
//   WHERE clients.user_id = ? (el userId del JWT)
// El cliente nunca puede ver reservas de otros usuarios
// porque la query filtra por su propio user_id.
```

---

## 19. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin registro público | Los usuarios los crea el SuperAdmin o Recepción. Los huéspedes no se registran solos. |
| RS-02 | Sin recuperación de contraseña por correo | Solo cambio de contraseña autenticado. Sin Resend en v1. |
| RS-03 | Sin cancelación por el cliente | El cliente puede ver sus reservas pero no cancelarlas. Solo Recepción y SuperAdmin pueden cancelar. |
| RS-04 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login SuperAdmin. |
| RS-05 | Auditoría no editable | Append-only en Blob. |

---

## 20. Glosario

| Término | Definición |
|---|---|
| **SuperAdmin** | Rol con acceso total al sistema incluyendo CRUD de habitaciones y usuarios. |
| **Recepción** | Rol operativo. Gestiona clientes y reservas. No puede eliminar habitaciones. |
| **Cliente** | Huésped del hotel con cuenta de usuario. Solo ve sus propias reservas. |
| **Solapamiento** | Condición en que dos reservas comparten fechas en la misma habitación. El sistema lo impide. |
| **Snapshot de precio** | Copia del precio por noche en el momento de crear la reserva. No cambia si el precio de la habitación cambia después. |
| **Portal del cliente** | Sección `/my-reservations` accesible solo con role='cliente'. Muestra únicamente las reservas propias. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Edwin Ramos | Doc: 1082894778
> Curso: Lógica y Programación — SIST0200
