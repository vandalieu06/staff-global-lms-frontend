# Stack técnico

Stack del frontend de Staff Global LMS. Versiones comprobadas en npm el **2026-10-22**
(`latest` en ese momento). Se fijan versiones exactas en `package.json` y se actualizan con
una spec.

**Estado:** propuesto (spec 01 de la versión 0.1.0). Aún no hay código.

## Núcleo

| Pieza | Paquete | Versión | Notas |
| --- | --- | --- | --- |
| Gestor de paquetes | `pnpm` | 11.25.0 | Fijado con `"packageManager"` en `package.json`. |
| Runtime | Node.js | ≥ 22.22 (local: 24.19.0) | Lo exige React Router 8. Fijado en `.nvmrc` y `engines`. |
| Bundler / dev server | `vite` | 8.3.5 | Plantilla `react-ts` de `create-vite` 9.3.1. |
| Plugin React | `@vitejs/plugin-react` | 6.1.2 | |
| UI | `react`, `react-dom` | 19.3.1 | |
| Router | `react-router` | 8.5.0 | Ver «React Router» más abajo. |
| Componentes | `shadcn` (CLI) | 4.22.1 | Copia los componentes en `src/components/ui/`. |
| Estilos | `tailwindcss`, `@tailwindcss/vite` | 4.3.3 | Tailwind v4, configuración en CSS (`@theme`). |
| Iconos | `lucide-react` | 1.61.0 | Set por defecto de shadcn. |
| Formularios | `react-hook-form` + `zod` | 7.90.0 / 4.6.7 | Login y cambio de contraseña. |
| i18n | `i18next` + `react-i18next` | 26.5.5 / 17.1.2 | Solo español en el prototipo; preparado para más idiomas. |
| Visor PDF | `react-pdf` | 11.0.0 | Usa `pdfjs-dist` 6.3. |
| Lenguaje | `typescript` | 6.0.3 | Ver «TypeScript» más abajo. |

## Calidad

| Pieza | Paquete | Versión |
| --- | --- | --- |
| Tests unitarios y de componentes | `vitest` | 5.0.5 |
| Entorno DOM | `jsdom` | 30.1.3 |
| Testing Library | `@testing-library/react` / `user-event` / `jest-dom` | 16.3.3 / 14.6.8 / 7.0.1 |
| Lint | `eslint` + `typescript-eslint` | 10.13.0 / 8.72.0 |

## Desviaciones respecto a «latest»

### React Router: `react-router` en lugar de `react-router-dom`

`react-router-dom` se quedó en la **7.18.4**: no existe versión 8. Desde la v7 es solo un
reexport de `react-router`, y en la v8 ese paquete único es el oficial. Para tener el router en
su versión más reciente se instala **`react-router@8.5.0`** y se importa todo desde
`"react-router"` (`createBrowserRouter`, `RouterProvider`, `Link`, `useNavigate`…).

Se usa el **modo datos** (`createBrowserRouter` + `RouterProvider`), no el modo framework:
el prototipo es una SPA sin SSR y así no se añade el plugin ni la configuración de framework.

### TypeScript 6.0.3 en lugar de 7.0.2

La `latest` de TypeScript es la 7.0.2 (compilador nativo), pero `typescript-eslint` 8.72 solo
admite TypeScript `<6.1.0`. Se usa la **6.0.3** para mantener el lint con tipos. Se subirá a la 7
cuando `typescript-eslint` la admita (spec propia).

## Decisiones de arquitectura

- **SPA móvil**: una columna de máx. 480 px centrada; en escritorio se ve como un móvil.
- **Sin backend en el prototipo**: los datos salen de `src/mocks/` (contenido de
  [contenido-ejemplo](contenido-ejemplo/dermoconsejeras-verano-2026.md)) a través de una capa de
  acceso asíncrona (`src/api/`) que imita una API con latencia. Al conectar el backend real solo
  cambia esa capa.
- **Progreso del alumno en `localStorage`** (clave versionada `sgg-lms:v1`) con un *store*
  propio basado en `useSyncExternalStore`. Sin librería de estado global.
- **Tema** de shadcn mapeado desde [`DESIGN.md`](../DESIGN.md) (variables CSS en `src/index.css`).
- **Alias** `@/` → `src/`.

## Scripts previstos

| Script | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo (`--host` para abrirlo desde el móvil en la red local) |
| `pnpm build` | `tsc -b && vite build` |
| `pnpm preview` | Sirve el build |
| `pnpm test` | Vitest |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc -b --noEmit` |
