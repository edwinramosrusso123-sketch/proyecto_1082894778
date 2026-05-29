-- HotelApp — esquema completo en Supabase Postgres
-- Toda la data del dominio + auditoría vive aquí.

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Usuarios ────────────────────────────────────────────────
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

-- ── Habitaciones ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number     VARCHAR(10)   NOT NULL UNIQUE,            -- RN-10
  type            VARCHAR(10)   NOT NULL
                  CHECK (type IN ('simple', 'doble', 'suite')),
  status          VARCHAR(15)   NOT NULL DEFAULT 'disponible'
                  CHECK (status IN ('disponible', 'ocupada', 'mantenimiento')),
  price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night > 0),
  description     TEXT,
  created_at      TIMESTAMPTZ   DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type   ON rooms(type);

-- ── Clientes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID         REFERENCES users(id) ON DELETE SET NULL,
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(120) UNIQUE NOT NULL,        -- RN-06
  phone                 VARCHAR(20),
  identification_number VARCHAR(30)  UNIQUE NOT NULL,        -- RN-06
  created_at            TIMESTAMPTZ  DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_id_number ON clients(identification_number);

-- ── Reservas ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id                       UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id                  UUID          NOT NULL REFERENCES rooms(id),
  client_id                UUID          NOT NULL REFERENCES clients(id),
  check_in                 DATE          NOT NULL,
  check_out                DATE          NOT NULL,
  price_per_night_snapshot DECIMAL(10,2) NOT NULL,           -- RN-07
  total_amount             DECIMAL(12,2) NOT NULL,           -- RN-08
  status                   VARCHAR(15)   NOT NULL DEFAULT 'activa'
                           CHECK (status IN ('activa', 'completada', 'cancelada')),
  created_by               UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by             UUID          REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ   DEFAULT NOW(),
  CHECK (check_out > check_in)
);
CREATE INDEX IF NOT EXISTS idx_res_room_dates ON reservations(room_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_res_client     ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_res_status     ON reservations(status);

-- ── Auditoría (en Supabase, no en Blob) ─────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp  TIMESTAMPTZ  DEFAULT NOW(),
  user_id    UUID,
  user_email VARCHAR(120),
  user_role  VARCHAR(15),
  action     VARCHAR(40)  NOT NULL,
  entity     VARCHAR(20)  NOT NULL,
  entity_id  UUID,
  summary    TEXT         NOT NULL,
  metadata   JSONB
);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
