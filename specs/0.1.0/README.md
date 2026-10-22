# Versión 0.1.0 — Prototipo navegable

**Objetivo:** convertir los mockups en una web app real que se pueda abrir en el móvil y recorrer
de principio a fin con lógica real (desbloqueo de capítulos, materiales vistos, test que corrige,
progreso guardado), **sin backend**: datos mock y progreso en `localStorage`. El código es la base
del producto, no un desechable.

Referencias: [stack](../../docs/stack.md) · [pantallas](../../docs/pantallas.md) ·
[decisiones](../../docs/decisiones.md) · [DESIGN.md](../../DESIGN.md) · mockups
https://claude.ai/artifact/LVgAGm6TCGkMxiEMvK14vW

## Specs y orden de implementación

| # | Spec | Entrega | Depende de | Estimación |
| --- | --- | --- | --- | --- |
| 01 | [Base del proyecto y stack](01-base-proyecto.md) | Proyecto Vite + React Router + shadcn + pnpm con tema, layouts, rutas vacías, i18n y tests | — | 0,5 día |
| 02 | [Datos mock, progreso y reglas](02-datos-progreso-reglas.md) | Seed de la formación, capa `api/` mock, store de progreso, reglas de desbloqueo y nota | 01 | 0,5 día |
| 03 | [Acceso, Mis cursos y perfil](03-acceso-cursos-perfil.md) | Pantallas 1.1, 1.2, 2.1, 2.2, 2.3 | 02 | 0,5–1 día |
| 04 | [Capítulo y visores](04-capitulo-visores.md) | Pantallas 3.1–3.4 y materiales de muestra | 02 | 0,5–1 día |
| 05 | [Test del capítulo y del curso](05-test.md) | Pantallas 4.1–4.5 | 02, 04 | 0,5–1 día |

Total estimado: **2,5–4 días**. 03 y 04 pueden hacerse en paralelo tras 02.

**Estado (2026-10-22):** las 5 specs están completadas. Queda la prueba en móviles físicos y
los puntos pendientes de `docs/decisiones.md` §8.

Cada spec se aprueba por separado (`proposed` → `approved`), se implementa y se cierra en un
commit `(spec NN)` según `AGENTS.md`.

## Fuera de alcance de 0.1.0

- Backend, autenticación real y panel de administración.
- Idiomas distintos del español (la estructura i18n sí queda lista).
- Modo oscuro, PWA/instalable, notificaciones.
- Despliegue: pendiente de decidir dónde publicarlo (Vercel, Netlify o servidor de Staff). Hasta
  entonces se prueba con `pnpm dev --host` en la red local o con `pnpm preview`.

## Pendiente de confirmar antes de 04/05

- Materiales reales del capítulo 2 (si no llegan, se usan muestras generadas, ver spec 04).
- Contenido de los capítulos 3–5 y del test final (si no llega, se marcan como «Contenido pendiente», ver spec 02).
