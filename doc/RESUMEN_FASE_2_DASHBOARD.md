# Resumen — Fase 2: Dashboard, Layout y bootstrap

- **Objetivo:** Implementar layout con sidebar por rol, dashboard con KPIs y gráfica placeholder, y middleware que restrinja el portal del cliente.

- **Acciones ejecutadas:**
  - Añadido `middleware.ts` que redirige a usuarios con role='cliente' hacia `/my-reservations` si intentan acceder a rutas privadas no permitidas.
  - Añadido `app/components/Sidebar.tsx` (cliente) que muestra items según `role` extraído del JWT en `localStorage`.
  - Añadidos componentes: `KpiCard`, `OccupancyChart`.
  - Implementado `app/dashboard/page.tsx` con 4 KPIs y gráfico placeholder.
  - Implementado `app/my-reservations/page.tsx` con empty state.
  - Integrado `Sidebar` en `app/layout.tsx`.

- **Archivos creados/modificados:**
  - Creado: `middleware.ts`
  - Creado: `app/components/Sidebar.tsx`
  - Creado: `app/components/KpiCard.tsx`
  - Creado: `app/components/OccupancyChart.tsx`
  - Creado: `app/dashboard/page.tsx`
  - Creado: `app/my-reservations/page.tsx`
  - Modificado: `app/layout.tsx`

- **Pruebas y verificación:**
  - Para probar localmente: iniciar la app (`npm run dev`) y usar la cuenta de `recepcion` o `superadmin` para ver sidebar completo; usar `cliente` (si se crea) para confirmar redirecciones.

- **Observaciones:**
  - Middleware depende de la cookie `token`. La implementación de login actual guarda el token en `localStorage`; para que middleware funcione en sesiones reales, el login API debería establecer la cookie `token`. Esto se documenta en el resumen de la Fase 1.

- **Estado final:** COMPLETADA (con observación sobre cookie vs localStorage)
