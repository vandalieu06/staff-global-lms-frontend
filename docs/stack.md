# Stack técnico

Stack del frontend de Staff Global LMS. Versiones `latest` comprobadas en npm el **2026-10-22**
y fijadas de forma exacta en `package.json` (sin `^`). Se actualizan solo con una spec.

**Estado:** implementado (spec 01 de la versión 0.1.0).

## Núcleo

| Pieza | Paquete | Versión | Notas |
| --- | --- | --- | --- |
| Gestor de paquetes | `pnpm` | 11.25.0 | `"packageManager"` en `package.json`. |
| Runtime | Node.js | ≥ 22.22 (`.nvmrc`: 24) | Lo exige React Router 8. |
| Bundler / dev server | `vite` | 8.3.5 | Plantilla `react-ts` de `create-vite` 9.3.1. |
| Plugin React | `@vitejs/plugin-react` | 6.1.2 | |
| UI | `react`, `react-dom` | 19.3.1 | |
| Router | `react-router` | 8.5.0 | Ver «React Router». |
| Componentes | `shadcn` (CLI y `shadcn/tailwind.css`) | 4.22.1 | Estilo `radix-nova`; componentes en `src/components/ui/`. |
| Primitivas | `radix-ui` | 1.8.1 | Base de los componentes shadcn. |
| Utilidades de clases | `cn` · `class-variance-authority` | 0.5.0 · 0.7.1 | `cn` es el paquete oficial de shadcn (clsx + tailwind-merge). |
| Estilos | `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | Tailwind v4, tema en `src/index.css`. |
| Animaciones | `tw-animate-css` | 1.4.0 | Las usan los componentes shadcn. |
| Fuente | `@fontsource-variable/inter` | 5.3.0 | Inter autoalojada (sin Google Fonts). |
| Iconos | `lucide-react` | 1.61.0 | |
| Avisos | `sonner` | 2.0.8 | Tema claro fijo. |
| i18n | `i18next` + `react-i18next` | 26.5.5 / 17.1.2 | Español; textos en `src/locales/es.json`, tipados. |
| Lenguaje | `typescript` | 6.0.3 | Ver «TypeScript». |

Se añaden en specs posteriores: `react-hook-form` + `zod` (03), `react-pdf` (04).

## Calidad

| Pieza | Paquete | Versión |
| --- | --- | --- |
| Tests | `vitest` + `jsdom` | 5.0.5 / 30.1.3 |
| Testing Library | `@testing-library/react` / `user-event` / `jest-dom` | 16.3.3 / 14.6.8 / 7.0.1 |
| Lint | `oxlint` | 1.89.0 |

## Desviaciones respecto a lo pedido o a «latest»

### React Router: `react-router` en lugar de `react-router-dom`

`react-router-dom` se quedó en la **7.18.4** y no existe en v8: desde la v7 era solo un reexport
de `react-router`. Se usa **`react-router@8.5.0`** importando desde `"react-router"`
(y `RouterProvider` desde `"react-router/dom"`). **Modo datos** (`createBrowserRouter`), no modo
framework: SPA sin SSR.

### TypeScript 6.0.3 en lugar de 7.0.2

Es la versión que fija la plantilla de `create-vite`. TypeScript 7 (compilador nativo) se
evaluará en una spec propia.

### oxlint en lugar de ESLint

La plantilla actual de `create-vite` usa oxlint. Configuración en `.oxlintrc.json`.

### Seguridad de pnpm 11

pnpm 11 no instala por defecto versiones publicadas hace muy poco (`minimumReleaseAge`). Las
excepciones aceptadas están en `pnpm-workspace.yaml` (`minimumReleaseAgeExclude`).

## Arquitectura

```
src/
  app/            router.tsx (rutas), layouts/ (RootLayout, TabsLayout), NotFoundPage
  components/     AppHeader, BottomNav, StickyFooter, ScreenPlaceholder · ui/ (shadcn)
  features/       auth/ · cursos/ · perfil/ · materiales/ · test/   (una página por pantalla)
  api/            acceso a datos (mock en 0.1.0) — spec 02
  mocks/          datos de ejemplo — spec 02
  lib/            utils, i18n · progreso y reglas — spec 02
  locales/        es.json
  types/          tipos globales (i18next)
  test/           setup de Vitest
```

- **SPA móvil**: `RootLayout` centra una columna de máx. 480 px; `TabsLayout` añade la barra
  inferior solo a Mis cursos y Perfil.
- **Rutas perezosas**: cada página exporta `Component` y se carga con `lazy`. El test final
  reutiliza las pantallas del test (`useTestScope` decide el ámbito por la URL).
- **Sin backend en 0.1.0**: datos desde `src/mocks/` a través de `src/api/` (asíncrono, con
  latencia simulada); progreso en `localStorage` (spec 02).
- **Tema** de `DESIGN.md` en `src/index.css`: variables shadcn, colores `brand-*`, `success`,
  utilidad `bg-brand-gradient`. Botón con tamaños `touch` (48 px) e `icon-touch` (44 px).
- **Alias** `@/` → `src/`.

## Datos y progreso (0.1.0)

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| Modelo | `src/types/domain.ts` | Formación, curso, capítulo, material, pregunta, test, intento, progreso. |
| Datos de ejemplo | `src/mocks/seed.ts`, `usuarios.ts` | Curso Dermoconsejera (preguntas reales de los capítulos 1–2) y la cuenta demo. |
| Capa de datos | `src/api/` | Única puerta de las pantallas a los datos: auth, cursos, tests, demo. Errores tipados y latencia simulada. |
| Reglas | `src/lib/rules.ts` | Funciones puras: desbloqueo en orden, test tras ver materiales, aciertos necesarios, corrección, progreso, siguiente paso. |
| Estado persistente | `src/lib/local-store.ts` + `session-store.ts` + `progress-store.ts` | JSON versionado en `localStorage` con hooks `useSyncExternalStore` (`useSesion`, `useProgreso`, `useUsuarioActual`). |
| Orden de respuestas | `src/lib/shuffle.ts` | Barajado determinista por intento y pregunta. |
| Presets de demo | `src/mocks/demo-presets.ts` vía `src/api/demo.ts` | «Inicio», «Capítulo 2 a medias», «Curso aprobado» y reinicio completo. |

Cuenta demo: `lucia.fernandez@email.com` / `provisional` (primer acceso: pide cambiarla).

## Scripts

| Script | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo con `--host` (abrir desde el móvil en la misma red) |
| `pnpm build` | `tsc -b && vite build` |
| `pnpm preview` | Sirve el build (`--host`) |
| `pnpm test` / `pnpm test:watch` | Vitest |
| `pnpm lint` | oxlint |
| `pnpm typecheck` | `tsc -b --noEmit` (app, Vite y tests con `tsconfig.test.json`) |
