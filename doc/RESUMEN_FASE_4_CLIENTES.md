# Resumen — Fase 4: Gestión de Clientes y Portal del Huésped

- **Objetivo:** Implementar gestión de clientes, búsquedas rápidas y vinculación de cliente ↔ usuario para acceso al portal.

- **Acciones ejecutadas:**
  - Creado: `data/clients.json` (almacenamiento local de clientes).
  - Implementado `POST /api/clients` que valida unicidad de `email` y `identification_number`. Retorna 409 con mensajes específicos según la regla RN-06.
  - Opción `create_user` en la creación de cliente: crea un `user` en `data/seed.json` con `role='cliente'`, genera contraseña temporal, marca `must_change_password=true`, y vincula `user_id` en el cliente. Credenciales devueltas una sola vez en la respuesta.
  - Implementado `GET /api/clients/search?q=` que busca por `name` o `identification_number` (ILIKE) y retorna hasta 10 resultados.
  - Implementado `GET /api/clients/[id]` con RN-09: si el requester es `role='cliente'` (según JWT en header `Authorization: Bearer <token>`), se valida que `client.user_id === payload.sub`; si no coincide, retorna 403.

- **Archivos creados/modificados:**
  - Creado: `data/clients.json`
  - Creado: `app/api/clients/route.ts`
  - Creado: `app/api/clients/search/route.ts`
  - Creado: `app/api/clients/[id]/route.ts`

- **Pruebas recomendadas:**
  - Crear cliente sin usuario → aparece en `GET /api/clients`.
  - Crear cliente con `create_user=true` → credenciales temporales visibles en la respuesta (entregar al huésped). Verificar que el usuario puede hacer login y que `must_change_password` se registra en `data/seed.json`.
  - Crear dos clientes con el mismo documento → `POST /api/clients` → 409 con mensaje "Ya existe un cliente con ese número de documento.".
  - Probar `GET /api/clients/[id]` con token de cliente diferente → 403.

- **Estado final:** COMPLETADA
