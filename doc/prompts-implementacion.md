# Prompts de Implementación — Fullstack TypeScript + Vercel

> **Instrucción de uso:**  
> Ejecuta cada prompt en orden. Copia el bloque completo de cada prompt en una conversación nueva con Claude.  
> No omitas ningún prompt aunque una fase parezca simple — cada uno actualiza el estado de ejecución y genera el archivo de resumen de fase.

---

## Cómo usar este archivo

1. Abre `estado-ejecucion.md` para ver el estado actual antes de ejecutar cualquier prompt.
2. Copia el prompt de la fase correspondiente (todo el bloque entre los separadores `---`).
3. Adjunta o pega el contenido de los tres archivos de contexto indicados en cada prompt.
4. Ejecuta el prompt y espera a que Claude complete **todas** las instrucciones, incluyendo la actualización del estado y la creación del archivo de resumen de fase.

---

## FASE 1 — Scaffolding inicial

### Prompt 1.1 — Crear estructura del proyecto

```
Actúa como ingeniero fullstack senior especializado en TypeScript y Next.js 14.

Antes de hacer cualquier cosa, lee completamente los siguientes tres documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución del proyecto

Una vez leídos, realiza lo siguiente en orden estricto:

PASO 1 — REGISTRO DE INICIO:
En el archivo estado-ejecucion.md, actualiza la sección "Historial de ejecución" agregando una nueva entrada con este formato:
- Fase: 1.1
- Tarea: Crear estructura del proyecto
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior

PASO 2 — EJECUCIÓN:
Siguiendo exactamente la sección 3 (Estructura de carpetas) y la sección 10 Fase 1 del plan, genera:
a) El comando completo de `create-next-app` con todas las flags correctas
b) Los comandos bash para crear todas las carpetas: data/, lib/, types/, app/api/data/
c) Los comandos touch para crear todos los archivos vacíos necesarios
d) El contenido completo y final del archivo package.json con todas las dependencias de la sección 2.3
e) El contenido completo del .gitignore apropiado para Next.js + Node.js
f) Verificación: lista cada archivo y carpeta creada con un checkbox [ ] para que el usuario confirme

PASO 3 — REGISTRO DE CIERRE:
En estado-ejecucion.md, actualiza la entrada 1.1 cambiando:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: Estructura de carpetas y archivos base creados
Además actualiza el campo "Fase actual" a: 1.2
Actualiza el campo "Último cambio" con la fecha actual.

PASO 4 — ARCHIVO DE RESUMEN DE FASE:
Crea un nuevo archivo llamado resumen-fase-1.md con el siguiente contenido:
- Título: Resumen Fase 1 — Scaffolding Inicial
- Fecha de ejecución
- Qué se hizo exactamente (lista detallada)
- Archivos y carpetas creados (árbol de directorios)
- Comandos ejecutados
- Observaciones o advertencias encontradas
- Estado: COMPLETADO
- Próxima fase: 2.1
```

---

## FASE 2 — Tipado y capa de datos

### Prompt 2.1 — Interfaces TypeScript y JSON base de datos

```
Actúa como ingeniero fullstack senior especializado en TypeScript y arquitectura de datos.

Antes de hacer cualquier cosa, lee completamente los siguientes tres documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución del proyecto
3. resumen-fase-1.md — lo que se realizó en la fase anterior

Verifica que el estado-ejecucion.md muestre la Fase 1.1 como COMPLETADO antes de continuar.
Si no está completado, detente y notifica al usuario.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md, agrega una nueva entrada en "Historial de ejecución":
- Fase: 2.1
- Tarea: Interfaces TypeScript y JSON como base de datos
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior

PASO 2 — EJECUCIÓN:
Siguiendo exactamente las secciones 4.1, 5.1, 5.2 y 5.3 del plan, genera el contenido completo y final de:
a) types/index.ts — todas las interfaces definidas en la sección 5.2
b) data/site.json — estructura exacta de la sección 5.1
c) lib/dataService.ts — servicio completo de la sección 5.3
d) tsconfig.json — configuración exacta de la sección 4.1, verificando que resolveJsonModule esté en true
Para cada archivo: muestra el path completo, el contenido listo para copiar y una explicación de una línea de por qué cada decisión de TypeScript es importante.

PASO 3 — VALIDACIÓN:
Proporciona el comando exacto para verificar que TypeScript acepta los tipos:
npx tsc --noEmit
Explica qué error aparecería si resolveJsonModule estuviera en false y por qué.

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 2.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: Tipos definidos, site.json creado, dataService implementado
Actualiza "Fase actual" a: 2.2
Actualiza "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE:
Crea resumen-fase-2.md con:
- Título: Resumen Fase 2 — Tipado y capa de datos
- Fecha de ejecución
- Archivos creados con su propósito
- Decisiones de TypeScript tomadas y por qué
- Posibles errores comunes y cómo evitarlos
- Estado: COMPLETADO
- Próxima fase: 3.1
```

---

## FASE 3 — Configuración del proyecto

### Prompt 3.1 — Archivos de configuración

```
Actúa como ingeniero fullstack senior especializado en configuración de proyectos Next.js y Vercel.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-2.md — lo realizado en la fase anterior

Verifica que estado-ejecucion.md muestre las fases 1.1 y 2.1 como COMPLETADO.
Si alguna no está completada, detente y notifica al usuario indicando cuál falta.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 3.1
- Tarea: Archivos de configuración del proyecto
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior

PASO 2 — EJECUCIÓN:
Genera el contenido completo y final de:
a) next.config.ts — sección 4.2 del plan, con comentarios explicativos en cada opción
b) vercel.json — sección 4.3, explicando por qué se usa la región gru1
c) .eslintrc.json — configuración compatible con Next.js 14 y TypeScript strict
d) .env.local — sección 9 del plan (aclarar que NO se sube a GitHub)
e) .env.example — versión sin valores reales para documentar variables en el repo
Indica para cada archivo si debe o no estar en .gitignore y por qué.

PASO 3 — VERIFICACIÓN DE GITIGNORE:
Revisa el .gitignore creado en la Fase 1 y confirma que incluye:
- .env.local
- .env*.local
- .next/
- node_modules/
Si falta alguno, proporciona la línea exacta a agregar.

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 3.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: next.config.ts, vercel.json, eslint y variables de entorno configurados
Actualiza "Fase actual" a: 4.1
Actualiza "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE:
Crea resumen-fase-3.md con:
- Título: Resumen Fase 3 — Configuración del proyecto
- Fecha de ejecución
- Archivos de configuración creados
- Opciones clave de cada archivo y su propósito
- Variables de entorno definidas
- Estado: COMPLETADO
- Próxima fase: 4.1
```

---

## FASE 4 — Frontend: Home con efecto elegante

### Prompt 4.1 — Layout raíz y estilos globales

```
Actúa como diseñador UX/UI y desarrollador frontend senior con expertise en animaciones CSS y Next.js App Router.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-3.md — lo realizado en la fase anterior

Verifica que las fases 1.1, 2.1 y 3.1 estén COMPLETADAS en estado-ejecucion.md.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 4.1
- Tarea: Layout raíz y estilos globales con animaciones
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Diseñador UX/UI + Frontend Senior

PASO 2 — EJECUCIÓN:
Genera el contenido completo y final de:
a) app/globals.css — con las animaciones de la sección 6.1 del plan más:
   - Reset CSS moderno (box-sizing, margin 0, padding 0)
   - Variables CSS para colores y tipografía
   - Las clases hero-title, hero-subtitle y hero-badge con sus animaciones
   - Media query para respetar prefers-reduced-motion
b) app/layout.tsx — layout raíz con:
   - Metadata tipada con TypeScript (título, descripción desde plan)
   - Import de globals.css
   - Fuente del sistema o Google Font si mejora la estética
   - Estructura HTML semántica correcta
Justifica cada decisión de diseño desde la perspectiva UX/UI.

PASO 3 — CRITERIO DE DISEÑO:
Explica brevemente:
- Por qué el efecto fadeInUp + shimmer es considerado "elegante" y no distractor
- Cómo el efecto respeta la accesibilidad (prefers-reduced-motion)
- Qué hace el efecto shimmer sobre el texto y cómo se logra con CSS puro

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 4.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: globals.css con animaciones y layout.tsx implementados
Actualiza "Fase actual" a: 4.2
Actualiza "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE (parcial):
Crea resumen-fase-4.md con la sección 4.1:
- Título: Resumen Fase 4 — Frontend Home (en progreso)
- Subtítulo: 4.1 — Layout y estilos
- Fecha
- Archivos creados
- Decisiones de diseño
- Nota: este archivo se completará en el prompt 4.2
```

### Prompt 4.2 — Componente Home page.tsx

```
Actúa como diseñador UX/UI y desarrollador frontend senior con expertise en React Server Components y TypeScript.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-4.md — lo realizado en 4.1 (layout y estilos)

Verifica que la fase 4.1 esté COMPLETADA en estado-ejecucion.md.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 4.2
- Tarea: Componente Home — page.tsx
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Diseñador UX/UI + Frontend Senior

PASO 2 — EJECUCIÓN:
Genera el contenido completo y final de app/page.tsx siguiendo la sección 6.2 del plan:
a) Debe ser un React Server Component async
b) Usa getSiteDataSafe() para obtener los datos desde site.json
c) Implementa generateMetadata() con tipos correctos de Next.js
d) El diseño debe tener: badge superior, título "Hola Mundo" con clases de animación, subtítulo
e) El layout debe estar perfectamente centrado usando flexbox en el main
f) Agrega un pequeño indicador visual discreto en la esquina inferior derecha que muestre la versión del proyecto (tomada de site.json) — esto valida que el flujo de datos JSON → TypeScript → UI funciona end-to-end

PASO 3 — REVISIÓN DE ACCESIBILIDAD UX:
Revisa el componente y confirma:
- El h1 tiene el texto principal (correcto para SEO y screen readers)
- El contraste de colores cumple WCAG AA mínimo
- La animación no es el único indicador visual de contenido

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 4.2:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: page.tsx con Home implementado, datos desde JSON, efecto elegante funcionando
Actualiza "Fase actual" a: 5.1
Actualiza "Último cambio" con la fecha actual.

PASO 5 — COMPLETAR ARCHIVO DE RESUMEN DE FASE:
Actualiza resumen-fase-4.md agregando la sección 4.2 y marcando la fase como completada:
- Subtítulo: 4.2 — Componente Home
- Fecha
- Archivos creados/modificados
- Flujo de datos: site.json → dataService → page.tsx → UI
- Decisiones de diseño y accesibilidad
- Estado final: COMPLETADO
- Próxima fase: 5.1
```

---

## FASE 5 — Backend: API Route

### Prompt 5.1 — API Route y validación backend

```
Actúa como ingeniero fullstack senior especializado en Next.js API Routes y arquitecturas serverless.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-4.md — lo realizado en el frontend

Verifica que las fases 4.1 y 4.2 estén COMPLETADAS en estado-ejecucion.md.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 5.1
- Tarea: API Route — endpoint de datos
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior

PASO 2 — EJECUCIÓN:
Genera el contenido completo y final de app/api/data/route.ts siguiendo la sección 7 del plan:
a) Implementa el handler GET con tipado correcto de NextRequest y NextResponse
b) Usa getSiteDataSafe() con manejo de errores try/catch
c) Agrega headers de respuesta apropiados (Content-Type, Cache-Control)
d) Incluye un handler OPTIONS para CORS básico
e) Agrega comentarios TypeScript explicando el tipado de cada parte
f) Proporciona el comando curl para probar el endpoint localmente:
   curl http://localhost:3000/api/data

PASO 3 — PRUEBA DE TIPOS:
Explica qué garantiza TypeScript en esta API route específicamente:
- Por qué NextRequest es mejor que Request nativo
- Qué pasa si site.json tiene un campo faltante (error en tiempo de compilación vs runtime)

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 5.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: API route GET /api/data implementada y tipada
Actualiza "Fase actual" a: 6.1
Actualiza "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE:
Crea resumen-fase-5.md con:
- Título: Resumen Fase 5 — Backend API Route
- Fecha de ejecución
- Endpoint creado: método, path, respuesta esperada
- Tipado implementado
- Cómo probar el endpoint
- Estado: COMPLETADO
- Próxima fase: 6.1
```

---

## FASE 6 — CI/CD: GitHub Actions

### Prompt 6.1 — Pipeline de validación TypeScript

```
Actúa como ingeniero DevOps y fullstack senior especializado en GitHub Actions y pipelines de CI/CD para proyectos TypeScript.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-5.md — lo realizado en la fase anterior

Verifica que todas las fases previas (1.1 a 5.1) estén COMPLETADAS en estado-ejecucion.md.
Si alguna no está completada, lista las faltantes y detente.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 6.1
- Tarea: GitHub Actions — pipeline CI/CD
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero DevOps + Fullstack Senior

PASO 2 — EJECUCIÓN:
Genera el contenido completo y final de:
a) .github/workflows/ci.yml — siguiendo exactamente la sección 8.2 del plan, con:
   - Job de typecheck (tsc --noEmit)
   - Job de lint (eslint)
   - Configuración de caché de npm para velocidad
   - Comentarios explicando cada step
b) Un archivo .github/pull_request_template.md con checklist para PRs:
   - [ ] TypeScript sin errores
   - [ ] Linter sin errores
   - [ ] Probado localmente
   - [ ] estado-ejecucion.md actualizado si aplica

PASO 3 — GUÍA DE VINCULACIÓN VERCEL:
Proporciona los pasos exactos de la sección 8.3 del plan para vincular el repositorio con Vercel, con capturas de pantalla descritas (qué buscar en cada pantalla).

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 6.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: GitHub Actions configurado, PR template creado, guía Vercel documentada
Actualiza "Fase actual" a: 7.1
Actualiza "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE:
Crea resumen-fase-6.md con:
- Título: Resumen Fase 6 — CI/CD GitHub Actions
- Fecha de ejecución
- Archivos creados
- Flujo del pipeline explicado
- Pasos para vincular Vercel
- Estado: COMPLETADO
- Próxima fase: 7.1
```

---

## FASE 7 — Validación final y primer despliegue

### Prompt 7.1 — Checklist de validación y commit inicial

```
Actúa como ingeniero fullstack senior y tech lead responsable de validar que un proyecto está listo para producción.

Antes de hacer cualquier cosa, lee completamente los siguientes documentos que te adjunto:
1. plan-infraestructura-fullstack.md — el plan completo de arquitectura
2. estado-ejecucion.md — el estado actual de ejecución
3. resumen-fase-6.md — lo realizado en la fase anterior

Verifica que TODAS las fases previas (1.1 a 6.1) estén COMPLETADAS en estado-ejecucion.md.
Si alguna no está completada, lista las faltantes, no continúes y pide al usuario resolverlas primero.

PASO 1 — REGISTRO DE INICIO:
En estado-ejecucion.md agrega:
- Fase: 7.1
- Tarea: Validación final y primer despliegue
- Estado: EN PROGRESO
- Inicio: [fecha y hora actual]
- Ejecutor: Ingeniero Fullstack Senior — Tech Lead

PASO 2 — CHECKLIST DE VALIDACIÓN:
Genera un checklist completo basado en la sección 11 del plan. Para cada ítem proporciona:
- El comando exacto a ejecutar (si aplica)
- La salida esperada
- Qué hacer si falla

Los ítems son:
a) npx tsc --noEmit → sin errores
b) npm run lint → sin warnings ni errores
c) npm run dev → servidor en localhost:3000
d) GET / → "Hola Mundo" centrado con animación visible
e) GET /api/data → JSON válido con estructura de site.json
f) git push a main → Action de GitHub pasa en verde
g) Vercel deploy → URL de producción activa y funcional

PASO 3 — COMANDOS PARA PRIMER COMMIT:
Proporciona exactamente los comandos git de la sección 10 Fase 4 del plan, adaptados con el mensaje de commit correcto en Conventional Commits.

PASO 4 — REGISTRO DE CIERRE:
En estado-ejecucion.md actualiza la entrada 7.1:
- Estado: COMPLETADO
- Fin: [fecha y hora actual]
- Resultado: Proyecto validado y desplegado en producción
Actualiza los campos:
- "Fase actual": PROYECTO COMPLETADO
- "Estado general": PRODUCCIÓN
- "URL de producción": [la URL que Vercel asignó]
- "Último cambio" con la fecha actual.

PASO 5 — ARCHIVO DE RESUMEN DE FASE:
Crea resumen-fase-7.md con:
- Título: Resumen Fase 7 — Validación Final y Despliegue
- Fecha de ejecución
- Resultado de cada ítem del checklist
- URL de producción
- Estado: COMPLETADO

PASO 6 — RESUMEN EJECUTIVO FINAL:
Al final del archivo resumen-fase-7.md agrega una sección "Resumen ejecutivo del proyecto" con:
- Qué se construyó
- Stack tecnológico utilizado
- Todas las fases completadas con sus fechas
- URL de producción
- Próximos pasos sugeridos para escalar el proyecto (referencia a sección 13 del plan)
```

---

## Notas finales

- Cada prompt es **autocontenido**: incluye toda la instrucción necesaria.
- Si un prompt falla a mitad de ejecución, puedes repetirlo — el estado-ejecucion.md indicará dónde quedó.
- Los archivos `resumen-fase-N.md` son el registro permanente de cada fase; el `estado-ejecucion.md` es la bitácora dinámica.
- Nunca saltes una fase: cada prompt verifica el estado de las fases anteriores antes de proceder.
