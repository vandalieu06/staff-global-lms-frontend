---
code: "01"
title: "Despliegue en GitHub Pages desde la rama deploy"
project: "staff-global-lms"
status: completed # proposed | approved | in-progress | completed
version: "0.1.1"
date: 2026-10-22
tags: [spec, sdd, deploy, ci]
affected_files:
  - .github/workflows/deploy.yml
  - vite.config.ts
  - src/app/router.tsx
  - src/mocks/seed.ts
  - src/mocks/seed.test.ts
  - docs/despliegue.md
  - docs/stack.md
  - docs/README.md
  - README.md
  - AGENTS.md
  - specs/0.1.1/README.md
  - specs/0.1.1/00-changelog.md
---

# 01 · Despliegue en GitHub Pages desde la rama deploy

## Purpose

Publicar el prototipo en una URL pública
(**https://vandalieu06.github.io/staff-global-lms-frontend/**) para que Staff lo pruebe en sus
móviles, con un flujo controlado: lo que está en `main` solo se publica cuando se fusiona un PR de
`main` a `deploy`.

## Context

- Repo público `vandalieu06/staff-global-lms-frontend`; ramas `main` (por defecto) y `deploy`,
  ambas en `c70233a` (0.1.0 completa).
- La app es una SPA de Vite que hoy asume que se sirve desde `/`. GitHub Pages de un repo de
  proyecto la sirve desde `/staff-global-lms-frontend/`, y no tiene reescrituras de rutas: una
  URL profunda (p. ej. `/cursos/dermoconsejera`) devuelve el `404.html` del sitio.
- Las rutas de los materiales del seed son absolutas (`/mock/materiales/…`).

## Proposed change

1. **Base configurable.** `vite.config.ts` toma `base` de la variable `BASE_PATH` (por defecto
   `/`). En local y en tests no cambia nada; el workflow construye con
   `BASE_PATH=/staff-global-lms-frontend/`.
2. **Router con `basename`** `import.meta.env.BASE_URL` (sin la barra final) en
   `createBrowserRouter`.
3. **Materiales con la base.** `seed.ts` construye las URL con `import.meta.env.BASE_URL`
   (`${BASE_URL}mock/materiales/…`). `seed.test.ts` sigue comprobando los archivos en `public/`.
4. **Rutas profundas en Pages.** Tras el build se copia `dist/index.html` a `dist/404.html`: Pages
   sirve la app para cualquier ruta y React Router la resuelve. (El servidor responde 404 en esas
   URL, sin efecto para el usuario.)
5. **Workflow `.github/workflows/deploy.yml`:**
   - **`pull_request` hacia `deploy`** → job *verificar*: comprueba que el PR viene de `main`
     (si no, falla con un mensaje), instala con `pnpm install --frozen-lockfile` y ejecuta lint,
     typecheck, tests y build. **No publica.**
   - **`push` a `deploy`** (es decir, al fusionar el PR) y `workflow_dispatch` → job *build*
     (mismas comprobaciones + `upload-pages-artifact`) y job *deploy* (`deploy-pages`, entorno
     `github-pages`, URL en el resumen).
   - Node desde `.nvmrc`, pnpm desde `packageManager` (`pnpm/action-setup`), caché de pnpm.
   - Permisos mínimos (`contents: read`; `pages: write` e `id-token: write` solo en *deploy*) y
     `concurrency` para no solapar despliegues.
   - Versiones de actions (últimas a 2026-10-22): `actions/checkout@v7`, `actions/setup-node@v7`,
     `pnpm/action-setup@v6`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`,
     `actions/deploy-pages@v5`.
6. **Configuración del repo (con `gh`, sin código):**
   - Activar Pages con origen *GitHub Actions* (`build_type: workflow`).
   - Permitir que el entorno `github-pages` despliegue desde la rama `deploy` (por defecto solo
     admite la rama por defecto).
   - Proteger `deploy`: cambios solo por PR y con el check *verificar* en verde (sin pushes
     directos).
7. **Documentación:** `docs/despliegue.md` con el flujo (trabajar en `main` → PR `main → deploy`
   → revisar check → fusionar → publicado), la URL, cómo relanzar y cómo comprobarlo.

## Technical decision

- **GitHub Actions + `deploy-pages`** en lugar de publicar en una rama `gh-pages`: no ensucia el
  historial, despliega desde un artefacto y es el método recomendado por GitHub.
- **Desplegar al fusionar, no al abrir el PR:** lo publicado siempre es lo revisado. El PR solo
  ejecuta las comprobaciones.
- **`404.html` como copia de `index.html`** en lugar de pasar a `createHashRouter`: las URL siguen
  limpias y el código no cambia de router.
- **`BASE_PATH` por variable de entorno:** el mismo código sirve en local (`/`) y en Pages
  (`/staff-global-lms-frontend/`) o en cualquier otro dominio futuro.

## Affected files

Los del frontmatter. La configuración del punto 6 se hace por API y se documenta en
`docs/despliegue.md`.

## Tests

- Los 104 tests actuales siguen en verde (base `/`).
- `BASE_PATH=/staff-global-lms-frontend/ pnpm build` + `pnpm preview` y recorrido con
  `agent-browser`: login, una ruta profunda recargada, un PDF, un vídeo y la descarga.
- En GitHub: un PR de prueba `main → deploy` ejecuta *verificar* sin publicar; al fusionarlo se
  publica y la URL pública carga.

## Acceptance criteria

- [x] Abrir un PR de `main` a `deploy` ejecuta lint, typecheck, tests y build, y no publica (PR #2: *Verificar* en 34 s, *Publicar* omitido).
- [x] Un PR hacia `deploy` desde otra rama falla el check (PR #1, cerrado y rama borrada).
- [x] Fusionar el PR publica en https://vandalieu06.github.io/staff-global-lms-frontend/ (run 39818641931).
- [x] En la URL pública funcionan el login, la navegación, recargar una ruta profunda y los
      materiales (PDF, imagen, vídeo, audio y descargas).
- [x] No se puede hacer push directo a `deploy` (GH006: *Changes must be made through a pull request*).
- [x] `docs/despliegue.md` explica el flujo.

## Implementation notes

- **Repo temporal:** público y personal (`vandalieu06`); al conectar con el backend se migrará al
  repo privado de la empresa (anotado en `docs/despliegue.md`).
- Al activar Pages, GitHub añadió `main` como rama permitida del entorno `github-pages`; se quitó
  para que solo `deploy` pueda publicar.
- Protección de `deploy` con `enforce_admins`: tampoco el propietario puede saltarse el PR.
  Revisión requerida con 0 aprobaciones (basta con el check en verde).
- Los PR se fusionan con *merge commit* para conservar el historial de `main` en `deploy`.
- Probado en local con un servidor estático que imita Pages (base y `404.html`) antes de publicar.
- Aviso de GitHub: `ubuntu-latest` pasa a Ubuntu 26 desde el 19-10-2026; el workflow no depende de
  la versión del sistema.

