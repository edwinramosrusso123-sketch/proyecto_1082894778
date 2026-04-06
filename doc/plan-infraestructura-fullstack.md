# Plan de Infraestructura — Fullstack TypeScript con Vercel y JSON como base de datos

> **Versión:** 1.0  
> **Stack:** Next.js 14 · TypeScript · Vercel · GitHub  
> **Objetivo inicial:** Home con "Hola Mundo" centrado y efecto elegante para validar TypeScript end-to-end

---

## 1. Visión general de la arquitectura

```
GitHub (repositorio fuente)
        │
        │  push / PR
        ▼
  Vercel CI/CD
        │
        │  build (next build)
        ▼
┌──────────────────────────────┐
│        Next.js 14 App        │
│                              │
│  /app          (frontend)    │
│  /app/api      (backend API) │
│  /data         (JSON "DB")   │
│  /lib          (utilidades)  │
│  /types        (interfaces)  │
└──────────────────────────────┘
        │
        │  lee/escribe
        ▼
   /data/*.json   ← "Base de datos"
```

**Principio de diseño:** no existe ninguna base de datos externa. Toda la persistencia vive en archivos `.json` dentro de la carpeta `/data`, versionados en GitHub y accedidos mediante utilidades tipadas en TypeScript.

---

## 2. Requisitos del sistema

### 2.1 Herramientas locales

| Herramienta | Versión mínima | Propósito |
|-------------|---------------|-----------|
| Node.js | 20 LTS | Runtime |
| npm / pnpm | npm 10 / pnpm 8 | Gestión de dependencias |
| Git | 2.40+ | Control de versiones |
| VS Code (recomendado) | última | Editor con soporte TypeScript |

### 2.2 Cuentas y servicios externos

| Servicio | Rol |
|----------|-----|
| GitHub | Repositorio fuente y trigger de despliegues |
| Vercel | Hosting, CI/CD automático y edge functions |

### 2.3 Dependencias del proyecto

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

## 3. Estructura de carpetas del repositorio

```
mi-proyecto/
├── .github/
│   └── workflows/
│       └── ci.yml              ← validación TypeScript en cada PR
├── app/
│   ├── layout.tsx              ← layout raíz con metadata
│   ├── page.tsx                ← Home — "Hola Mundo" con efecto
│   ├── globals.css             ← estilos globales + animaciones
│   └── api/
│       └── data/
│           └── route.ts        ← endpoint de ejemplo que lee JSON
├── data/
│   └── site.json               ← configuración del sitio (JSON "DB")
├── lib/
│   └── dataService.ts          ← utilidades tipadas para leer JSON
├── types/
│   └── index.ts                ← interfaces TypeScript globales
├── public/
│   └── favicon.ico
├── next.config.ts
├── tsconfig.json
├── .eslintrc.json
├── .gitignore
├── vercel.json
└── package.json
```

---

## 4. Configuración de archivos clave

### 4.1 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

> **Nota importante:** `"resolveJsonModule": true` permite importar archivos `.json` directamente con tipos automáticos, lo que habilita el patrón de JSON como base de datos.

### 4.2 `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,   // rutas tipadas — valida TypeScript en navegación
  },
};

export default nextConfig;
```

### 4.3 `vercel.json`

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["gru1"]
}
```

> `gru1` = región de São Paulo — más cercana a Colombia para menor latencia.

---

## 5. La "base de datos" JSON

### 5.1 Estructura de `/data/site.json`

```json
{
  "meta": {
    "title": "Mi App Fullstack",
    "description": "Proyecto TypeScript con Next.js y Vercel",
    "version": "1.0.0"
  },
  "home": {
    "headline": "Hola Mundo",
    "subtitle": "TypeScript funcionando correctamente",
    "animationStyle": "fadeInUp"
  }
}
```

### 5.2 Tipado de los datos en `/types/index.ts`

```typescript
export interface SiteMeta {
  title: string;
  description: string;
  version: string;
}

export interface HomeContent {
  headline: string;
  subtitle: string;
  animationStyle: 'fadeInUp' | 'fadeIn' | 'slideIn';
}

export interface SiteData {
  meta: SiteMeta;
  home: HomeContent;
}
```

### 5.3 Servicio de lectura en `/lib/dataService.ts`

```typescript
import type { SiteData } from '@/types';
import siteJson from '@/data/site.json';

// TypeScript infiere el tipo automáticamente gracias a resolveJsonModule
export function getSiteData(): SiteData {
  return siteJson as SiteData;
}

// Para uso server-side con validación en tiempo de ejecución
export async function getSiteDataSafe(): Promise<SiteData> {
  const data = getSiteData();

  if (!data.meta || !data.home) {
    throw new Error('Estructura de datos inválida en site.json');
  }

  return data;
}
```

---

## 6. Implementación del Home — "Hola Mundo" con efecto elegante

### 6.1 `/app/globals.css` — animación

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.hero-title {
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  background: linear-gradient(
    90deg,
    #1a1a2e 0%,
    #16213e 30%,
    #0f3460 60%,
    #533483 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards,
             shimmer 4s linear 0.9s infinite;
}

.hero-subtitle {
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.hero-badge {
  animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
}
```

### 6.2 `/app/page.tsx` — componente Home

```typescript
import type { Metadata } from 'next';
import { getSiteDataSafe } from '@/lib/dataService';
import type { HomeContent } from '@/types';

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getSiteDataSafe();
  return {
    title: meta.title,
    description: meta.description,
  };
}

export default async function HomePage() {
  const { home }: { home: HomeContent } = await getSiteDataSafe();

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#f9f9fb',
      }}
    >
      <span className="hero-badge"
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#888',
          fontWeight: 500,
        }}
      >
        TypeScript · Next.js · Vercel
      </span>

      <h1
        className="hero-title"
        style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 800, margin: 0 }}
      >
        {home.headline}
      </h1>

      <p
        className="hero-subtitle"
        style={{ fontSize: '1.1rem', color: '#666', margin: 0 }}
      >
        {home.subtitle}
      </p>
    </main>
  );
}
```

---

## 7. API Route de ejemplo — `/app/api/data/route.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteDataSafe } from '@/lib/dataService';

export async function GET(_request: NextRequest) {
  try {
    const data = await getSiteDataSafe();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
```

---

## 8. Pipeline de CI/CD

### 8.1 Flujo automático con GitHub + Vercel

```
desarrollador
     │  git push / PR
     ▼
GitHub Repository
     │
     ├─── GitHub Actions (ci.yml)
     │         └── tsc --noEmit   ← valida tipos TypeScript
     │         └── eslint          ← linting
     │
     └─── Vercel (webhook automático)
               ├── rama main       → producción (mi-app.vercel.app)
               └── otras ramas     → preview URL única por PR
```

### 8.2 `.github/workflows/ci.yml`

```yaml
name: CI — TypeScript Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: Validar TypeScript
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Verificar tipos TypeScript
        run: npx tsc --noEmit

      - name: Ejecutar linter
        run: npm run lint
```

### 8.3 Vinculación Vercel ↔ GitHub (pasos únicos)

1. Acceder a [vercel.com](https://vercel.com) e iniciar sesión.
2. **Add New Project** → **Import Git Repository** → seleccionar el repositorio.
3. Framework preset: `Next.js` (detectado automáticamente).
4. Variables de entorno: ninguna requerida en esta fase inicial.
5. Hacer clic en **Deploy**.

A partir de ese momento, cada `push` a `main` dispara un deploy de producción automático.

---

## 9. Variables de entorno

En esta etapa inicial no se requieren variables de entorno. La siguiente tabla define las que se agregarán a futuro:

| Variable | Entorno | Propósito |
|----------|---------|-----------|
| `NEXT_PUBLIC_APP_URL` | producción | URL pública de la app |
| `DATA_PATH` | desarrollo | Ruta alternativa a `/data` en local |

Crear archivo `.env.local` en local (nunca subir a GitHub):

```bash
# .env.local — solo para desarrollo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Pasos de implementación — orden de ejecución

### Fase 1 — Scaffolding inicial

```bash
# 1. Crear proyecto con Next.js + TypeScript
npx create-next-app@latest mi-proyecto \
  --typescript \
  --eslint \
  --app \
  --no-tailwind \
  --src-dir=false \
  --import-alias="@/*"

cd mi-proyecto

# 2. Crear estructura de carpetas
mkdir -p data lib types app/api/data

# 3. Crear archivos base
touch data/site.json
touch lib/dataService.ts
touch types/index.ts
```

### Fase 2 — Implementar código

Crear los archivos en el orden definido en la sección 5 y 6:

1. `types/index.ts`
2. `data/site.json`
3. `lib/dataService.ts`
4. `app/globals.css` (agregar animaciones)
5. `app/page.tsx`
6. `app/api/data/route.ts`

### Fase 3 — Verificar localmente

```bash
# Instalar dependencias
npm install

# Verificar TypeScript sin compilar
npx tsc --noEmit

# Servidor de desarrollo
npm run dev
# → Abrir http://localhost:3000
# → Verificar que "Hola Mundo" aparece centrado con efecto
# → Abrir http://localhost:3000/api/data para ver la API
```

### Fase 4 — Subir a GitHub y desplegar

```bash
git init
git add .
git commit -m "feat: scaffolding inicial con Hola Mundo TypeScript"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mi-proyecto.git
git push -u origin main
```

Luego vincular con Vercel según la sección 8.3.

---

## 11. Criterios de validación

Al finalizar la implementación, todos los siguientes puntos deben cumplirse:

- [ ] `npx tsc --noEmit` finaliza sin errores
- [ ] `npm run lint` finaliza sin errores
- [ ] `npm run dev` levanta el servidor correctamente
- [ ] La ruta `/` muestra "Hola Mundo" centrado con efecto de animación
- [ ] La ruta `/api/data` retorna JSON válido con los datos de `site.json`
- [ ] El primer commit en `main` dispara un deploy exitoso en Vercel
- [ ] La URL de producción en Vercel muestra el mismo resultado que local
- [ ] Los PRs generan una URL de preview independiente

---

## 12. Convenciones y buenas prácticas del proyecto

| Aspecto | Convención |
|---------|------------|
| Nombres de archivos | `kebab-case` para páginas/rutas, `PascalCase` para componentes |
| Interfaces TypeScript | Prefijo sin `I` — usar `SiteData` no `ISiteData` |
| Funciones async en Server Components | siempre `async/await`, nunca `.then()` |
| Archivos JSON | siempre con indentación de 2 espacios |
| Commits | Conventional Commits: `feat:`, `fix:`, `chore:` |
| Ramas | `main` = producción, `develop` = integración, `feature/*` = features |

---

## 13. Escalabilidad futura del patrón JSON

El patrón de carpeta `/data` puede escalar así conforme crezca el proyecto:

```
data/
├── site.json          ← configuración global
├── users.json         ← colección de usuarios
├── products.json      ← catálogo de productos
├── posts/
│   ├── 001.json
│   └── 002.json
└── _schema/
    └── users.schema.json   ← validación con zod (fase futura)
```

Cuando el volumen de datos supere lo manejable en JSON estáticos, la migración natural es a **Vercel KV** (Redis) o **PlanetScale** (MySQL serverless), sin cambiar la capa de `lib/dataService.ts` — solo su implementación interna.

---

*Plan generado como arquitecto de software. Versión 1.0 — lista para implementación inmediata.*
