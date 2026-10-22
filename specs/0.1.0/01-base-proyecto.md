---
code: "01"
title: "Base del proyecto y stack"
project: "staff-global-lms"
status: approved # proposed | approved | in-progress | completed
version: "0.1.0"
date: 2026-10-22
tags: [spec, sdd, setup, stack]
affected_files:
  - package.json
  - pnpm-lock.yaml
  - .nvmrc
  - .gitignore
  - index.html
  - vite.config.ts
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.node.json
  - eslint.config.js
  - components.json
  - src/main.tsx
  - src/index.css
  - src/app/router.tsx
  - src/app/layouts/RootLayout.tsx
  - src/app/layouts/TabsLayout.tsx
  - src/components/ui/*
  - src/components/AppHeader.tsx
  - src/components/BottomNav.tsx
  - src/components/StickyFooter.tsx
  - src/lib/utils.ts
  - src/lib/i18n.ts
  - src/locales/es.json
  - src/test/setup.ts
  - src/app/router.test.tsx
  - README.md
  - docs/stack.md
---

# 01 · Base del proyecto y stack

## Purpose

Crear el proyecto frontend con el stack acordado (Vite + React, React Router, shadcn/ui, pnpm,
versiones *latest*) y dejar listos el tema visual, la estructura de carpetas, los layouts de
navegación, las rutas del flujo, i18n y la infraestructura de tests. Al terminar, todas las rutas
existen y muestran su título, sin contenido real.

## Context

- El repo solo tiene documentación (`docs/`, `DESIGN.md`, `AGENTS.md`).
- Stack y versiones detallados en [`docs/stack.md`](../../docs/stack.md). Hay dos desviaciones
  justificadas allí: `react-router@8.5.0` en lugar de `react-router-dom` (sin v8) y
  TypeScript 6.0.3 (compatibilidad con `typescript-eslint`).
- Sistema visual en [`DESIGN.md`](../../DESIGN.md); pantallas y rutas en
  [`docs/pantallas.md`](../../docs/pantallas.md).

## Proposed change

1. **Scaffold** con `pnpm create vite@latest . --template react-ts`; `packageManager: "pnpm@11.25.0"`,
   `engines.node: ">=22.22"`, `.nvmrc` con `24`. Fijar versiones exactas de `docs/stack.md`.
2. **Tailwind v4** con `@tailwindcss/vite`; alias `@/` → `src/` en `vite.config.ts` y `tsconfig`.
3. **shadcn**: `pnpm dlx shadcn@latest init` (estilo por defecto, color base neutral, CSS
   variables). Sobrescribir las variables de `src/index.css` con las de `DESIGN.md` (primary
   `#8646b9`, background `#f9fafb`, radius 10 px, `--success*`, `--brand-gradient`). Fuente Inter
   (Google Fonts en `index.html`). Añadir componentes: `button`, `input`, `label`, `form`, `card`,
   `badge`, `progress`, `radio-group`, `accordion`, `alert`, `alert-dialog`, `avatar`, `separator`,
   `slider`, `select`, `sonner`.
4. **Estructura**:
   ```
   src/
     app/            router.tsx, layouts/ (RootLayout, TabsLayout)
     components/     ui/ (shadcn) + AppHeader, BottomNav, StickyFooter
     features/       auth/, cursos/, materiales/, test/   (pantallas por área, specs 03–05)
     api/            capa de datos mock (spec 02)
     mocks/          seed (spec 02)
     lib/            utils, i18n, progreso y reglas (spec 02)
     locales/        es.json
     test/           setup.ts
   ```
5. **Layouts**:
   - `RootLayout`: columna centrada `max-w-[480px]`, `min-h-dvh`, fondo `gray-50`, `<Outlet/>`.
   - `TabsLayout`: añade `BottomNav` (Mis cursos, Perfil) y padding inferior; solo para rutas raíz.
   - `AppHeader` (variantes *raíz* con título y *detalle* con volver/cerrar) y `StickyFooter`
     (barra de acción fija con `env(safe-area-inset-bottom)`).
6. **Rutas** (`createBrowserRouter`, modo datos, carga perezosa con `lazy` por pantalla):

   | Ruta | Pantalla | Layout |
   | --- | --- | --- |
   | `/login` | 1.1 Login | Root |
   | `/primer-acceso` | 1.2 Nueva contraseña | Root |
   | `/` | 2.1 Mis cursos | Tabs |
   | `/perfil` | 2.3 Perfil | Tabs |
   | `/perfil/contrasena` | 1.2 (variante cambio) | Root |
   | `/cursos/:cursoId` | 2.2 Curso · temario | Root |
   | `/cursos/:cursoId/capitulos/:capituloId` | 3.1 Capítulo | Root |
   | `/cursos/:cursoId/capitulos/:capituloId/materiales/:materialId` | 3.2–3.4 Visor | Root |
   | `/cursos/:cursoId/capitulos/:capituloId/test` | 4.1 Test · inicio | Root |
   | `/cursos/:cursoId/capitulos/:capituloId/test/intento` | 4.2 Pregunta | Root |
   | `/cursos/:cursoId/capitulos/:capituloId/test/resultado` | 4.3 / 4.4 Resultado | Root |
   | `/cursos/:cursoId/test-final[/intento\|/resultado]` | Test final (mismas pantallas) | Root |
   | `/cursos/:cursoId/aprobado` | 4.5 Curso aprobado | Root |
   | `*` | 404 sencillo con enlace a Mis cursos | Root |

   En esta spec cada ruta renderiza un *placeholder* con su `AppHeader` y título.
7. **i18n**: `i18next` + `react-i18next` con `es.json` como único idioma y `lang="es"`. Todos los
   textos de interfaz pasan por `t()`; el contenido de cursos no se traduce.
8. **Calidad**: Vitest + jsdom + Testing Library (`src/test/setup.ts` con `jest-dom`), ESLint de la
   plantilla, scripts `dev` (`--host`), `build`, `preview`, `test`, `lint`, `typecheck`.
9. **README.md** de la raíz: qué es, requisitos (Node 24, pnpm 11), comandos y enlaces a `docs/`.

## Technical decision

- **React Router en modo datos** en lugar de modo framework: SPA sin SSR; menos configuración y
  migración directa a *loaders* cuando exista API.
- **`react-router` 8** en lugar de `react-router-dom` 7: es el paquete oficial y el único con
  versión *latest* real.
- **Componentes shadcn copiados** en el repo (no librería): se ajustan al `DESIGN.md` sin pelear
  con estilos externos.
- **Sin librería de estado** (Redux/Zustand): el estado global es solo el progreso y la sesión mock
  (spec 02), cubierto con `useSyncExternalStore`.

## Affected files

Los listados en el frontmatter. Todo es nuevo salvo `README.md` (vacío) y `docs/stack.md`
(se actualiza el estado a «implementado» al cerrar).

## Tests

- `router.test.tsx`: cada ruta de la tabla renderiza su título; una ruta desconocida muestra el 404.
- `BottomNav` marca como activa la pestaña de la ruta actual (`aria-current="page"`).
- `pnpm build`, `pnpm lint` y `pnpm typecheck` sin errores.

## Acceptance criteria

- [ ] `pnpm install && pnpm dev` arranca con las versiones de `docs/stack.md`.
- [ ] Todas las rutas existen y navegan; Mis cursos y Perfil muestran la barra inferior, el resto no.
- [ ] Botón principal, fondo, radios y fuente coinciden con `DESIGN.md` (inspección visual a 390 px).
- [ ] Los componentes shadcn listados están en `src/components/ui/`.
- [ ] Tests, lint, typecheck y build en verde.
- [ ] `README.md` explica cómo arrancar el proyecto.
