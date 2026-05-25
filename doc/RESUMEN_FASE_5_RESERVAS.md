# Resumen — Fase 5: Sistema de Reservas

- **Objetivo:** Implementar la operación crítica de reservas con validaciones de disponibilidad, cálculo de montos y actualización del estado de habitaciones.

- **Acciones ejecutadas:**
  - Implementado `POST /api/reservations` con la secuencia requerida:
    1. Verificar que la habitación existe y está `disponible`.
    2. `checkAvailability`: comprobar solapamiento contra `data/reservations.json` para reservas con `status='activa'`.
    3. Calcular `nights` y `total_amount` usando `price_per_night_snapshot`.
    4. Insertar la reserva con `status='activa'` en `data/reservations.json`.
    5. Actualizar `rooms.status='ocupada'` en `data/seed.json`.
    6. Registrar en `data/audit.json`.
  - Implementado `PATCH /api/reservations/[id]/cancel` que valida `status='activa'`, marca `cancelada`, actualiza la habitación a `disponible` y registra en auditoría.

- **Archivos creados/modificados:**
  - Creado: `data/audit.json`
  - Modificado/Creado: `app/api/reservations/route.ts`
  - Creado: `app/api/reservations/[id]/cancel/route.ts`

- **Pruebas recomendadas:**
  - Intentar crear dos reservas simultáneas (simuladas) para la misma habitación y rango: la segunda debe devolver 409.
  - Verificar que tras crear una reserva la habitación pasa a `ocupada` en `data/seed.json`.
  - Cancelar reserva activa → habitación vuelve a `disponible`.

- **Limitaciones:**
  - La operación no es transaccional a nivel de base de datos; la implementación intenta una secuencia atómica en disco pero en entornos serverless con filesystem efímero/solo-lectura (Vercel) no es segura. En producción se recomienda usar transacciones en Postgres/Supabase o una RPC que garantice atomicidad.

- **Estado final:** COMPLETADA
