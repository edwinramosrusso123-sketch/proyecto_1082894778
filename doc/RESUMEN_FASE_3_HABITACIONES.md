# Resumen — Fase 3: Gestión de Habitaciones

- **Objetivo:** Implementar CRUD mínimo de habitaciones con validaciones de unicidad y cambios de estado seguros.

- **Acciones ejecutadas:**
  - Creado endpoint `GET /api/rooms` y `POST /api/rooms` en `app/api/rooms/route.ts`.
  - Implementado validación de `room_number` único; en caso de duplicado retorna 409 con el mensaje: "Ya existe una habitación con el número [X]."
  - Creado `PATCH /api/rooms/[id]/status` con la regla: solo se puede poner en `mantenimiento` si el estado actual es `disponible`.
  - Implementado `GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` que filtra usando `data/reservations.json`.
  - Persistencia basada en `data/seed.json` y `data/reservations.json` usando operaciones de lectura/escritura con `fs`.

- **Archivos creados/modificados:**
  - Creado: `data/reservations.json` (inicialmente vacío)
  - Creado: `app/api/rooms/route.ts`
  - Creado: `app/api/rooms/available/route.ts`
  - Creado: `app/api/rooms/[id]/status/route.ts`

- **Pruebas recomendadas:**
  - Crear habitación con número duplicado → `POST /api/rooms` → 409 con mensaje específico.
  - PATCH estado a `mantenimiento` sobre habitación con `status!='disponible'` → 409.
  - Verificar que las 4 habitaciones de `seed.json` aparecen en `GET /api/rooms`.
  - Insertar una reserva activa en `data/reservations.json` y llamar a `/api/rooms/available` para comprobar que la habitación ocupada no aparece.

- **Limitaciones / Observaciones:**
  - La persistencia usa archivos JSON y operaciones de `fs`; en entornos serverless con read-only filesystem (como Vercel en ejecución de funciones) este enfoque no es suficiente. Para producción, migrar a una base de datos (Supabase/Postgres).

- **Estado final:** COMPLETADA
