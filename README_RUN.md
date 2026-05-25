# Instrucciones rápidas — Ejecutar y probar HotelApp localmente

Resumen: este repositorio incluye implementaciones mínimas para las Fases 1–5 usando archivos JSON en `data/`. En este entorno no pude ejecutar `npm install` por restricciones de PowerShell; sigue los pasos abajo para ejecutar y probar localmente en tu máquina.

Requisitos locales
- Node.js 20+ y npm
- Git Bash, WSL, o PowerShell con permisos para ejecutar `npm` (si PowerShell bloquea, usa Git Bash o WSL)

Pasos para poner en marcha

1) Instalar dependencias

```powershell
# En PowerShell (si tu ExecutionPolicy lo permite)
npm install
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

Si PowerShell lanza error sobre ExecutionPolicy, abre Git Bash o WSL y ejecuta los mismos comandos allí.

2) Configurar variables de entorno

```powershell
# Opcional: establecer secret JWT (recomendado)
$env:JWT_SECRET = "mi-secreto-local"
# En Linux / Bash:
# export JWT_SECRET=mi-secreto-local
```

3) Ejecutar la app

```powershell
npm run dev
# abrir http://localhost:3000/login
```

Flujos de prueba manuales (curl)

- Login (dev):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@hotelapp.test","password":"supersecret"}'
```

Respuesta esperada: JSON con `token`.

- Listar habitaciones:

```bash
curl http://localhost:3000/api/rooms
```

- Crear habitación (duplicado -> 409):

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"room_number":"101","price_per_night":200}'
```

- Consultar habitaciones disponibles:

```bash
curl "http://localhost:3000/api/rooms/available?checkIn=2026-06-01&checkOut=2026-06-03"
```

- Crear cliente y usuario vinculado (retorna credenciales temporales):

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Perez","email":"juan@example.test","identification_number":"12345","create_user":true}'
```

- Crear reserva (ejemplo):

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"room_id":"r1","check_in":"2026-06-01","check_out":"2026-06-03","guest_name":"Juan Perez","created_by":"00000000-0000-0000-0000-000000000002"}'
```

- Cancelar reserva:

```bash
curl -X PATCH http://localhost:3000/api/reservations/res123456789/cancel \
  -H "Content-Type: application/json" \
  -d '{"cancelled_by":"00000000-0000-0000-0000-000000000002"}'
```

Scripts de prueba automáticos

- Bash (Linux / Git Bash / WSL): `tests/run-tests.sh` (incluye peticiones básicas).
- PowerShell: `tests/run-tests.ps1` (equivalente para Windows PowerShell).

- Notas importantes y recomendaciones
- La API de login ahora establece la cookie `token` (HttpOnly, Path=/, SameSite=Lax) para que `middleware.ts` pueda leerla y restringir rutas. En producción la cookie se marca `Secure`.
- Para desplegar en Vercel
  1. Conectar el repositorio a Vercel (Import Project → GitHub repo).
  2. En el panel del proyecto en Vercel, ir a **Settings → Environment Variables** y añadir:
     - `JWT_SECRET` = (tu secreto fuerte)
     - `NODE_ENV` = production (si no está establecido por defecto)
  3. Desplegar la rama `main`. Vercel ejecutará `npm run build` y luego servirá la app.

  Nota: en Vercel los archivos en `/data` son de solo lectura en producción; para producción debes migrar a una base de datos real (Supabase/Postgres). Este repo usa JSON para desarrollo/local.
- El almacenamiento en archivos JSON funciona para desarrollo local pero no para producción ni para entornos serverless (Vercel). Para producción usa Supabase/Postgres y transacciones para la Fase 5.

¿Quieres que agregue más pruebas automatizadas (por ejemplo, con Playwright o un pequeño conjunto de tests en Node)?