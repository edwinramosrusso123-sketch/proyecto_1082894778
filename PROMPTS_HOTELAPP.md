# PROMPTS DE IMPLEMENTACIÓN — HotelApp
> Prompts secuenciales para construir el sistema fase por fase
> Plan de referencia: `doc/PLAN_HOTELAPP.md`
> Estado de progreso: `doc/ESTADO_EJECUCION_HOTELAPP.md`

---

## INSTRUCCIONES DE USO

1. Ejecuta primero el **Prompt 0** — crea el archivo de seguimiento del proyecto.
2. Para cada fase siguiente, copia el bloque completo y pégalo en tu sesión de IA.
3. La IA leerá el plan, ejecutará la fase y dejará el estado actualizado.
4. No avances a la siguiente fase hasta que el resumen esté generado y el estado marcado como completado.

---

## PROTOCOLO DE EJECUCIÓN — APLICA A TODOS LOS PROMPTS

```
ANTES de escribir código:
1. Leer doc/PLAN_HOTELAPP.md
2. Leer doc/ESTADO_EJECUCION_HOTELAPP.md
3. Verificar que las fases previas estén completadas
4. Registrar inicio: estado En progreso + fecha y hora

DESPUÉS de completar el trabajo:
5. Registrar cierre: estado Completada + fecha y hora
6. Documentar: acciones ejecutadas, archivos creados/modificados, observaciones
7. Crear doc/RESUMEN_FASE_N_NOMBRE.md con: objetivo, acciones, archivos,
   decisiones técnicas y por qué, problemas encontrados y resolución,
   qué se probó y resultado, estado final EXITOSO / CON OBSERVACIONES / FALLIDO,
   prerrequisitos para la siguiente fase

NUNCA avanzar sin completar este protocolo.
```

---

---

## PROMPT 0 — Crear archivo de estado del proyecto

```
Actúa como Ingeniero de Proyectos. Tu única tarea es leer
doc/PLAN_HOTELAPP.md y crear el archivo
doc/ESTADO_EJECUCION_HOTELAPP.md.

El archivo debe contener:
- Información del proyecto: nombre, archivos de referencia, estudiante,
  fecha de inicio, estado general
- Dashboard de fases: tabla con todas las fases del plan incluyendo número,
  nombre, rol asignado, estado (todas inician como Pendiente), columnas para
  fecha de inicio, fecha de cierre y archivo de resumen
- Leyenda de estados: Pendiente, En progreso, Completada, Bloqueada, Pausada
- Historial de ejecución: sección append-only con fecha, hora, fase, evento y detalle

Toma los datos directamente del plan. No inventes fases ni cambies nombres ni roles.

Cuando termines escribe en el chat el nombre de cada fase detectada y confirma
que el archivo está listo para comenzar la Fase 1.

Tu trabajo termina aquí.
```

---

---

## PROMPT FASE 1 — Bootstrap, Login y `dataService` base

### Rol: `Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en
arquitectura de persistencia serverless, autenticación segura con JWT y
diseño de sistemas con múltiples roles de usuario incluyendo un portal de
autoservicio para clientes externos.

Tu mentalidad: HotelApp tiene tres tipos de usuarios con necesidades muy
distintas. El SuperAdmin es el dueño del hotel — necesita control total.
Recepción trabaja con esto todo el día — necesita velocidad. El Cliente es
el huésped — solo necesita ver sus reservas sin complicaciones. El sistema
tiene que redirigirlos al lugar correcto desde el primer segundo del login.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — secciones 7 (stack — nota que HotelApp NO usa
   Resend), 8 (reglas de oro — especialmente reglas 2, 3 y 4 sobre la
   atomicidad de las operaciones de reserva), 9 (seed.json con SuperAdmin
   y 4 habitaciones demo), 12 (blobAudit con getBlobToken lazy) y 18
   (flujo de login con redirección por rol y cómo se protege el portal
   del cliente)
2. doc/ESTADO_EJECUCION_HOTELAPP.md — registra el inicio de la Fase 1

Puntos críticos que no puedes ignorar:

— El JWT incluye el role ('superadmin', 'recepcion', 'cliente'). La
  redirección post-login es:
  superadmin → /dashboard
  recepcion  → /dashboard
  cliente    → /my-reservations
  Esta redirección ocurre en la página de login al recibir la respuesta
  exitosa del servidor, usando el role del JWT.

— No hay registro público. El formulario de login no tiene link de
  "Crear cuenta". Los usuarios de tipo 'cliente' los crea Recepción
  cuando el huésped llega al hotel.

— El token de Blob lazy, get() del SDK de Blob, withFileLock — patrón
  estándar del curso.

— La identidad visual del login: layout dividido (panel izquierdo teal
  oscuro con el nombre del hotel y tagline, panel derecho blanco con el
  formulario). Sección 16 del plan describe todo.

— El seedReader expone las 4 habitaciones demo para que en modo seed
  el SuperAdmin pueda ver la estructura antes del bootstrap.

Al terminar:
- npm run typecheck — cero errores
- Probar: login SuperAdmin → JWT con role='superadmin' → redirect /dashboard
  → modo seed confirmado
- Registra el cierre en ESTADO_EJECUCION_HOTELAPP.md
- Crea doc/RESUMEN_FASE_1_BOOTSTRAP.md

Tu trabajo termina aquí. No avances a la Fase 2.
```

---

---

## PROMPT FASE 2 — Dashboard, Layout y bootstrap

### Rol: `Diseñador Frontend Obsesivo + Ingeniero de Sistemas`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero de Sistemas
trabajando en conjunto. HotelApp tiene tres roles con experiencias de
navegación completamente distintas. El sidebar del SuperAdmin tiene todo.
El de Recepción tiene lo operativo. El del Cliente tiene solo dos ítems.
El middleware tiene que garantizar que el cliente no puede acceder a ninguna
ruta que no sea la suya.

Tu mentalidad: un recepcionista que abre el sistema a las 7am necesita ver
en segundos: ¿cuántas habitaciones están disponibles? ¿hay reservas que
entran hoy? El dashboard es la primera pantalla — tiene que responder esas
preguntas sin que tenga que navegar a ningún lado.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — paleta de colores (sección 16 — teal como primario,
   los badges de estado de habitación y reserva con sus hex exactos), el
   sidebar por rol, los componentes KpiCard y OccupancyChart, y la Fase 2
2. doc/ESTADO_EJECUCION_HOTELAPP.md — verifica Fase 1 completada, registra
   inicio de Fase 2

Puntos críticos que no puedes ignorar:

— El middleware.ts tiene que implementar la restricción del cliente de forma
  explícita: si el usuario tiene role='cliente', solo puede acceder a
  /my-reservations, /profile, /api/reservations/my y /api/auth/*.
  Cualquier otra ruta privada → redirect a /my-reservations.
  Un cliente que intente ir a /rooms → redirect inmediato.

— El sidebar del cliente tiene solo dos ítems: "Mis Reservas" y "Perfil".
  El cliente no debe ver ningún indicio de que existe un módulo de inventario
  de habitaciones o gestión de pedidos.

— Las 4 KPIs del dashboard son: habitaciones disponibles (verde), ocupadas
  (rojo), en mantenimiento (ámbar) y reservas activas hoy (teal). Cada
  KpiCard tiene un ícono Lucide relevante.

— La gráfica de ocupación es un Recharts BarChart que en esta fase puede
  mostrarse vacío o con datos de placeholder — los datos reales vienen en
  la Fase 6 cuando haya reservas reales.

— La página /my-reservations en este momento muestra un empty state
  "Aún no tienes reservas registradas." — los datos reales llegan en la
  Fase 5.

Al terminar:
- Probar los tres roles: SuperAdmin y Recepción ven el sidebar completo;
  cliente solo ve Mis Reservas y Perfil
- Verificar que el cliente no puede acceder a /rooms (redirect)
- Bootstrap completo: las 4 habitaciones demo en Supabase
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_2_DASHBOARD.md

Tu trabajo termina aquí. No avances a la Fase 3.
```

---

---

## PROMPT FASE 3 — Gestión de Habitaciones

### Rol: `Ingeniero Fullstack — CRUD de habitaciones con control de acceso`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
inventarios de recursos físicos con estados, validaciones de integridad
referencial y control de acceso diferenciado por rol.

Tu mentalidad: las habitaciones son el activo principal del hotel. Su estado
tiene que reflejar la realidad en tiempo real — si la habitación 201 está
ocupada, no puede aparecer como disponible para una nueva reserva. Los
cambios de estado manuales (poner en mantenimiento) los puede hacer
Recepción; crear y eliminar habitaciones solo el SuperAdmin.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — migration 0002 (rooms con sus checks), reglas
   RN-02, RN-05 y RN-10, los badges de estado (Disponible verde, Ocupada
   rojo, Mantenimiento ámbar), el endpoint /api/rooms/available, y la
   Fase 3 completa
2. doc/ESTADO_EJECUCION_HOTELAPP.md — verifica Fases 1 y 2 completadas,
   registra inicio de Fase 3

Puntos críticos que no puedes ignorar:

— RN-10: room_number es UNIQUE. Al capturar el error de Postgres (código
  '23505'): retornar 409 con "Ya existe una habitación con el número [X]."

— RN-05: al eliminar una habitación, verificar:
  SELECT COUNT(*) FROM reservations WHERE room_id = ? AND status IN
  ('activa', 'pendiente')
  Si > 0: retornar 409 con "Esta habitación tiene [N] reservas activas.
  No puede eliminarse hasta que se cancelen o completen."

— El endpoint GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
  retorna las habitaciones que NO tienen reservas activas que se solapen
  con el rango dado. La query de solapamiento:
  SELECT r.* FROM rooms r
  WHERE r.status = 'disponible'
  AND r.id NOT IN (
    SELECT res.room_id FROM reservations res
    WHERE res.status = 'activa'
    AND res.check_in < $checkOut
    AND res.check_out > $checkIn
  )
  Este endpoint es el que alimenta el selector de habitaciones en el
  formulario de nueva reserva.

— El cambio de estado a 'mantenimiento' (PATCH /api/rooms/[id]/status)
  solo funciona si la habitación está en 'disponible'. No se puede poner
  en mantenimiento una habitación 'ocupada' — eso causaría inconsistencia.
  Verificar el estado actual antes de aplicar el cambio.

Al terminar:
- Las 4 habitaciones demo del bootstrap aparecen en el inventario
- Crear habitación con número duplicado → 409
- PATCH estado a 'mantenimiento' → badge ámbar
- Verificar que el empleado de Recepción no ve el botón "Nueva habitación"
  ni "Eliminar"
- Verificar GET /api/rooms/available con fechas que tengan una reserva
  existente (insertar manualmente en Supabase) → la habitación ocupada no
  debe aparecer
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_3_HABITACIONES.md

Tu trabajo termina aquí. No avances a la Fase 4.
```

---

---

## PROMPT FASE 4 — Gestión de Clientes y Portal del Huésped

### Rol: `Ingeniero Fullstack — Registro de clientes y acceso al portal`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack especializado en gestión de
perfiles de clientes con validaciones de unicidad, búsqueda en tiempo real
y vinculación de cuentas de usuario para portales de autoservicio.

Tu mentalidad: el cliente del hotel es la persona que duerme en las
habitaciones. Tiene datos personales, tiene historial de reservas y,
opcionalmente, tiene acceso al portal web para ver sus reservas desde su
celular. La vinculación entre el registro de cliente y el usuario del
sistema es el mecanismo que hace posible ese portal.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — migration 0003 (clients con el campo user_id
   opcional), regla RN-06 (unicidad de email y documento), la relación
   users ↔ clients (sección 11), el caso CU-08, y la Fase 4 completa
2. doc/ESTADO_EJECUCION_HOTELAPP.md — verifica Fases 1 a 3 completadas,
   registra inicio de Fase 4

Puntos críticos que no puedes ignorar:

— La tabla clients tiene un campo user_id UUID REFERENCES users(id)
  ON DELETE SET NULL. Este campo es null para clientes sin cuenta digital.
  Cuando Recepción quiere darle acceso al portal a un huésped, crea un
  user con role='cliente' y vincula el user_id al registro del cliente.
  Esta vinculación puede hacerse en el mismo formulario de creación del
  cliente (checkbox "Dar acceso al portal") o después desde la vista de
  perfil del cliente.

— Al crear un usuario vinculado a un cliente: generar contraseña temporal
  con crypto.randomBytes, must_change_password=true, retornar en claro una
  sola vez para que Recepción se la entregue al huésped. El huésped en su
  primer login es redirigido a /profile para cambiarla.

— RN-06: email y identification_number tienen UNIQUE en la tabla. Si hay
  un conflicto, capturar el error de Postgres y retornar 409 con el mensaje
  exacto: "Ya existe un cliente con ese correo." o "Ya existe un cliente
  con ese número de documento." — no el mismo mensaje para los dos.

— El ClientSearchInput usa debounce de 300ms y llama a
  GET /api/clients/search?q=término que hace:
  SELECT * FROM clients WHERE LOWER(name) ILIKE '%q%'
  OR LOWER(identification_number) ILIKE '%q%'
  Retorna los primeros 10 resultados. El dropdown muestra nombre, documento
  y email del cliente.

— RN-09: cuando un usuario con role='cliente' consulta
  GET /api/clients/[id], el servidor verifica que el user_id del cliente
  coincide con el userId del JWT. Si intenta ver el perfil de otro cliente:
  403. No revelar que existe ese cliente.

Al terminar:
- Crear cliente sin cuenta de usuario → aparece en el listado
- Crear cliente con cuenta → credenciales temporales visibles una sola vez →
  el cliente hace login → redirigido a /profile → cambia contraseña →
  accede a /my-reservations
- Crear dos clientes con el mismo documento → 409 específico
- Probar ClientSearchInput: buscar por nombre parcial y por documento
- Verificar RN-09: el cliente autenticado no puede acceder al perfil de
  otro cliente (probar directamente con la API)
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_4_CLIENTES.md

Tu trabajo termina aquí. No avances a la Fase 5.
```

---

---

## PROMPT FASE 5 — Sistema de Reservas

### Rol: `Ingeniero Fullstack Senior — Operación más crítica del sistema`

---

```
Actúa EXCLUSIVAMENTE como Ingeniero Fullstack Senior especializado en sistemas
de reservas de recursos físicos, validaciones de disponibilidad temporal y
operaciones atómicas que modifican múltiples entidades simultáneamente.

Tu mentalidad: la reserva es la operación de mayor valor del sistema. Si dos
recepcionistas intentan reservar la misma habitación para el mismo período
simultáneamente, solo una debe tener éxito. Si la reserva se crea pero la
habitación no cambia a "ocupada", el hotel puede vender la misma habitación
dos veces. Esas dos garantías — exclusión de solapamiento y cambio atómico
de estado — son el corazón técnico del sistema.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — migration 0004 (reservations con la restricción
   check_out > check_in), la implementación completa de createReservation
   en lib/reservationService.ts (sección 10.4 — código comentado paso a paso),
   la query exacta de solapamiento (sección 11), reglas RN-01 al RN-09,
   el componente ReservationForm con DateRangePicker, y la Fase 5 completa
2. doc/ESTADO_EJECUCION_HOTELAPP.md — verifica Fases 1 a 4 completadas,
   registra inicio de Fase 5

Puntos críticos que no puedes ignorar:

— La secuencia de createReservation es atómica:
  (1) Verificar que la habitación existe y status='disponible' (RN-02).
  (2) checkAvailability: SELECT COUNT(*) FROM reservations WHERE room_id=?
      AND status='activa' AND check_in < checkOut AND check_out > checkIn.
      Si COUNT > 0: retornar 409 con "La habitación [número] no está
      disponible del [check_in] al [check_out]." — mensaje con las fechas.
  (3) Calcular noches = days between checkIn and checkOut.
  (4) INSERT INTO reservations con price_per_night_snapshot = room.price_per_night
      y total_amount = nights * price_per_night_snapshot. Status='activa'.
  (5) UPDATE rooms SET status='ocupada' WHERE id = roomId.
  (6) recordAudit.
  Los pasos 4 y 5 deben ocurrir en la misma operación o en secuencia
  sin puntos de fallo intermedios. Si el paso 5 falla, el estado de la
  reserva sería inconsistente — pero en Supabase con @supabase/supabase-js
  no hay transacciones nativas en el cliente. Usar una función RPC de
  Supabase o ejecutar los dos UPDATEs en secuencia inmediata aceptando
  que si el paso 5 falla, habría que corregir manualmente (documentar esto
  en el RESUMEN de la fase).

— cancelReservation: verificar que la reserva está en status='activa'. Si no:
  retornar 409 con "Solo se pueden cancelar reservas activas." Al cancelar:
  (1) UPDATE reservations SET status='cancelada', cancelled_by=userId,
      cancelled_at=NOW().
  (2) UPDATE rooms SET status='disponible' WHERE id = reservation.room_id.
  (3) recordAudit.

— El ReservationForm carga las habitaciones disponibles dinámicamente:
  cuando el usuario selecciona o cambia las fechas de check_in y check_out,
  el componente llama a GET /api/rooms/available?checkIn=&checkOut= y
  actualiza el listado de habitaciones disponibles. Esto evita que el
  recepcionista elija una habitación que va a estar ocupada.

— El DateRangePicker valida: check_in >= hoy (no en el pasado),
  check_out > check_in. Al seleccionar las fechas, muestra automáticamente
  el número de noches y el precio estimado (precio de la habitación × noches).

— RN-07 — snapshot: si el precio de la suite sube de $380.000 a $450.000
  mañana, las reservas existentes siguen con el precio original. Verificar
  esto explícitamente en las pruebas.

— La vista /my-reservations del cliente muestra sus reservas con todos los
  detalles: habitación, fechas, precio_snapshot, total y estado. El cliente
  no puede cancelar — solo ver.

Al terminar:
- Flujo completo: seleccionar fechas → ver habitaciones disponibles →
  elegir habitación → elegir cliente → ver el total calculado → confirmar →
  habitación cambia a ocupada → aparece en el listado de reservas
- Probar solapamiento: crear dos reservas para la misma habitación en
  fechas que se solapan → segunda retorna 409 con el mensaje descriptivo
- Probar cancelación: cancelar reserva → habitación vuelve a disponible
- Probar snapshot: cambiar el precio de la suite → ver que la reserva
  anterior conserva el precio original en price_per_night_snapshot
- Probar el portal del cliente: login como cliente → ver sus reservas
  en /my-reservations → verificar que no puede ver reservas de otros clientes
- npm run typecheck
- Registra el cierre y crea doc/RESUMEN_FASE_5_RESERVAS.md

Tu trabajo termina aquí. No avances a la Fase 6.
```

---

---

## PROMPT FASE 6 — Gráfica de Ocupación, Administración y Pulido Final

### Rol: `Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre del proyecto`

---

```
Actúa EXCLUSIVAMENTE como Diseñador Frontend Obsesivo e Ingeniero Fullstack
trabajando en conjunto. Esta es la fase de cierre de HotelApp.

Tu mentalidad: el hotel lo administran personas que trabajan con esto todos
los días — un recepcionista a las 6am y el dueño del hotel que revisa el
dashboard desde su celular en la noche. El sistema falla si el estado de
las habitaciones no refleja la realidad, si el portal del cliente es un
error de seguridad, o si la gráfica de ocupación no muestra datos correctos.

Antes de escribir una sola línea de código lee:
1. doc/PLAN_HOTELAPP.md — Fase 6 completa, los requerimientos no funcionales
   (RNF-01 al RNF-06) y las restricciones (sección 19)
2. doc/ESTADO_EJECUCION_HOTELAPP.md — verifica Fases 1 a 5 completadas,
   registra inicio de Fase 6

Lo que debes completar en esta fase:

Gráfica de ocupación semanal:
Instalar recharts. Implementar lib/dashboardService.ts:
getWeeklyOccupancy() calcula para cada uno de los últimos 7 días:
  ocupacion_pct = (count de habitaciones con reserva activa ese día /
                   total habitaciones) * 100
Query: para cada fecha en los últimos 7 días, contar reservas donde
check_in <= fecha AND check_out > fecha AND status='activa'.
Retornar array de 7 objetos { date: 'DD/MM', occupancy_pct: number }.
Integrar OccupancyChart (Recharts BarChart, barras teal) en el dashboard
con estos datos reales.

Administración de usuarios:
POST genera contraseña temporal, must_change_password=true, retorna en
claro una sola vez. Login → /profile si must_change_password.
Crear app/admin/users/page.tsx y app/admin/audit/page.tsx.

Empty states con el tono de HotelApp — directo y profesional:
- Dashboard sin reservas hoy: "No hay reservas activas para hoy."
- Listado de habitaciones vacío: "No hay habitaciones registradas."
  (admin ve el botón "Nueva habitación")
- Listado de clientes vacío: "No hay clientes registrados."
- Listado de reservas sin resultados para los filtros: "No hay reservas
  con los filtros seleccionados."
- Portal del cliente sin reservas: "Aún no tienes reservas registradas.
  Contacta con recepción para hacer tu reserva."

Manejo de errores global:
- 401: sesión expirada → toast + redirect a /login.
- 403 (cliente intenta acceder a ruta restringida): redirect silencioso
  a /my-reservations — sin mostrar el error. El cliente no debería saber
  que existe esa ruta.
- 409 solapamiento de reserva: mensaje descriptivo con las fechas del
  conflicto (no "Error 409" genérico).
- 409 habitación no disponible: "La habitación [número] está [estado]."
- 409 al eliminar habitación con reservas: conteo de reservas activas.
- 500: toast genérico.

Verificación de seguridad del portal del cliente en producción:
(1) Login como cliente → redirigido a /my-reservations.
(2) Intentar navegar a /rooms → redirect a /my-reservations.
(3) Intentar GET /api/rooms directamente → 403.
(4) Intentar GET /api/reservations directamente → 403.
(5) Intentar GET /api/clients/[id_de_otro_cliente] → 403.
Si cualquiera de estas verificaciones falla, hay un agujero de seguridad.

Para el cierre técnico:
- npm run typecheck — cero errores
- npm run lint — cero warnings
- npm run build — build exitoso
- Deploy en Vercel con todas las variables de entorno:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL, BLOB_READ_WRITE_TOKEN,
  JWT_SECRET, ADMIN_BOOTSTRAP_SECRET

Probar en producción el flujo completo con los tres roles:
SuperAdmin: bootstrap → crear habitaciones adicionales → crear usuario
de Recepción → crear cliente con cuenta digital.
Recepción: login → ver dashboard con KPIs reales → crear reserva →
habitación cambia a ocupada → gráfica de ocupación se actualiza.
Cliente: login → ver sus reservas en /my-reservations → intentar ir a
/rooms → redirect silencioso.

Al cerrar el proyecto:
- Registra la Fase 6 como Completada en ESTADO_EJECUCION_HOTELAPP.md
  con la URL de producción en el historial
- Crea doc/RESUMEN_FASE_6_PULIDO_FINAL.md con: URL de producción, URL del
  repositorio, funcionalidades implementadas, stack, tablas de Supabase
  creadas, decisiones técnicas destacadas (atomicidad de createReservation
  con cambio de estado de habitación, snapshot de precio, portal del
  cliente vinculado por user_id, gráfica de ocupación calculada por día,
  restricción de acceso del rol cliente en middleware) y estado final

El proyecto HotelApp está terminado. Tu trabajo en este repositorio
concluye aquí.
```

---

> Edwin Ramos — Doc: 1082894778
> Curso: Lógica y Programación — SIST0200
