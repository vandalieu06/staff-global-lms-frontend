# Despliegue

El prototipo se publica en **GitHub Pages**:
**https://vandalieu06.github.io/staff-global-lms-frontend/**

> **Temporal.** El repo `vandalieu06/staff-global-lms-frontend` es público y personal para poder
> enseñar el prototipo. Cuando el frontend se conecte al backend se migrará al repositorio privado
> de la empresa y este despliegue dejará de usarse. La URL pública y la cuenta demo
> (`lucia.fernandez@email.com` / `provisional`) son accesibles para cualquiera con el enlace: no
> subir contenido real ni confidencial de Staff mientras siga aquí.

## Ramas

| Rama | Para qué |
| --- | --- |
| `main` | Rama de trabajo (por defecto). Cada spec se cierra con un commit aquí. |
| `deploy` | Lo que está publicado. Solo cambia mediante PR desde `main`. |

## Flujo para publicar

1. Trabajar y hacer commit en `main` (con su spec, según `AGENTS.md`) y subirlo:
   `git push origin main`.
2. Abrir un PR de `main` a `deploy`:
   ```bash
   gh pr create --base deploy --head main --title "Despliegue: <qué cambia>" --body "<resumen>"
   ```
3. Esperar el check **Verificar** (lint, tipos, tests y build). En el PR no se publica nada.
4. Fusionar el PR (*merge commit*, para que `deploy` y `main` compartan historial):
   ```bash
   gh pr merge --merge
   ```
5. Al llegar el push a `deploy`, el workflow construye y publica. La URL aparece en el resumen del
   job **Publicar** y en *Settings › Environments › github-pages*.

Para volver a publicar sin cambios (p. ej. si falló Pages): *Actions › Despliegue › Run workflow*
sobre la rama `deploy`, o `gh workflow run Despliegue --ref deploy`.

## Cómo funciona

- **Workflow:** `.github/workflows/deploy.yml`.
  - `pull_request` → `deploy`: job **Verificar**. Rechaza PR que no vengan de `main`.
  - `push` a `deploy` y `workflow_dispatch`: **Verificar** + subida del artefacto `dist/` y job
    **Publicar** (`actions/deploy-pages`, entorno `github-pages`).
- **Ruta base:** Pages sirve la app en `/staff-global-lms-frontend/`. El workflow construye con
  `BASE_PATH=/<repo>/`; Vite (`base`), el router (`basename`) y las URL de los materiales la usan.
  En local la base es `/`.
- **Rutas profundas:** Pages no reescribe URL, así que el build copia `index.html` a `404.html`.
  Al abrir o recargar `/staff-global-lms-frontend/cursos/…` Pages responde con ese archivo (estado
  HTTP 404, invisible para el usuario) y React Router pinta la pantalla.
- **Progreso y sesión** viven en el navegador de cada persona (`localStorage`): cada tester tiene
  su propio estado. El panel de demo de Perfil permite reiniciarlo.

## Configuración del repositorio

Hecha con `gh` (spec 0.1.1/01); hay que repetirla si se crea otro repo:

| Ajuste | Valor |
| --- | --- |
| Pages | Origen *GitHub Actions* (`build_type: workflow`). |
| Entorno `github-pages` | Ramas permitidas para desplegar: `deploy`. |
| Protección de `deploy` | Cambios solo por PR, con el check **Verificar** en verde; sin push directo ni borrado. |

## Probar el build de Pages en local

```bash
BASE_PATH=/staff-global-lms-frontend/ pnpm build
cp dist/index.html dist/404.html
BASE_PATH=/staff-global-lms-frontend/ pnpm preview   # http://localhost:4173/staff-global-lms-frontend/
```

`vite preview` sí reescribe rutas profundas; para reproducir exactamente el comportamiento de
Pages hace falta un servidor estático que responda `404.html` a las rutas desconocidas.
