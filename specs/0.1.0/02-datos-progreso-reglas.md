---
code: "02"
title: "Datos mock, progreso y reglas"
project: "staff-global-lms"
status: completed # proposed | approved | in-progress | completed
version: "0.1.0"
date: 2026-10-22
tags: [spec, sdd, datos, reglas]
affected_files:
  - src/types/domain.ts
  - src/mocks/seed.ts
  - src/mocks/usuarios.ts
  - src/mocks/demo-presets.ts
  - src/mocks/seed.test.ts
  - src/api/index.ts
  - src/api/auth.ts
  - src/api/cursos.ts
  - src/api/demo.ts
  - src/api/errors.ts
  - src/api/latency.ts
  - src/lib/local-store.ts
  - src/lib/progress-store.ts
  - src/lib/session-store.ts
  - src/lib/rules.ts
  - src/lib/shuffle.ts
  - src/lib/rules.test.ts
  - src/lib/progress-store.test.ts
  - src/api/cursos.test.ts
  - src/test/setup.ts
  - src/test/arquitectura.test.ts
  - src/locales/es.json
  - tsconfig.json
  - tsconfig.app.json
  - tsconfig.test.json
  - docs/stack.md
  - specs/0.1.0/00-changelog.md
---

# 02 · Datos mock, progreso y reglas

## Purpose

Dar al prototipo datos reales de ejemplo y la lógica de negocio del LMS (sesión, materiales
vistos, desbloqueo de capítulos, corrección de tests, progreso del curso) en una capa
independiente de las pantallas, preparada para cambiarse por una API.

## Context

- Contenido de [`docs/contenido-ejemplo/dermoconsejeras-verano-2026.md`](../../docs/contenido-ejemplo/dermoconsejeras-verano-2026.md):
  capítulos 1 y 2 con 5 preguntas reales cada uno; capítulos 3–5 y test final pendientes.
- Reglas en [`docs/decisiones.md`](../../docs/decisiones.md) §2–§4.
- Depende de la spec 01.

## Proposed change

1. **Modelo** (`src/types/domain.ts`): `Usuario`, `Formacion`, `Curso`, `Capitulo`, `Material`
   (`tipo: "pdf" | "imagen" | "video" | "audio"`), `Pregunta` (`enunciado`, `respuestas[4]`,
   `correcta`, `explicacion`), `Test` (`preguntas`, `notaMinima` en %), `Intento`
   (`respuestas`, `aciertos`, `porcentaje`, `superado`, `fecha`), `ProgresoCurso`.
2. **Seed** (`src/mocks/seed.ts`): formación *DEMO Dermoconsejeras Verano 2026*, curso
   *Dermoconsejera*, 5 capítulos y test final.
   - Capítulos 1 y 2: título real, 80 %, sus 5 preguntas y 4 materiales cada uno (spec 04).
   - Capítulos 3–5: títulos provisionales de `decisiones.md` §7, marcados `contenidoPendiente: true`
     (se muestran en el temario pero, al desbloquearse, indican «Contenido pendiente de publicar»).
   - Test final: hasta recibir sus 15 preguntas usa las 10 de los capítulos 1–2, nota mínima 80 %
     (provisional).
3. **Usuarios mock** (`src/mocks/usuarios.ts`): `lucia.fernandez@email.com` / `provisional`
   (`mustChangePassword: true`).
4. **Capa `api/`**: funciones `async` con 200–400 ms de latencia simulada: `login`,
   `cambiarContrasena`, `getCursosAsignados`, `getCurso`, `getCapitulo`, `getMaterial`,
   `getTest`, `enviarIntento`. Errores tipados (`CredencialesInvalidas`, `NoEncontrado`,
   `Bloqueado`). Es el único punto que conocerá el backend real.
5. **Sesión** (`session-store.ts`): usuario actual en `localStorage`; guardas de ruta
   (sin sesión → `/login`; `mustChangePassword` → `/primer-acceso`).
6. **Progreso** (`progress-store.ts`): `localStorage` con clave `sgg-lms:v1`, expuesto con
   `useSyncExternalStore` (`useProgreso(cursoId)`). Guarda materiales vistos, intentos por test y
   fecha de aprobado. Si el JSON es inválido o de otra versión, se reinicia.
7. **Reglas puras** (`rules.ts`):
   - `estadoCapitulo` → `bloqueado | en-curso | superado` (en orden; solo uno en curso).
   - `testDesbloqueado` = todos los materiales del capítulo vistos.
   - `aciertosNecesarios(n, notaMinima) = ceil(n × notaMinima / 100)`.
   - `corregir(test, respuestas)` → aciertos, porcentaje (entero), superado, falladas con
     respuesta elegida, correcta y explicación.
   - `progresoCurso` = pasos superados / (capítulos + test final).
   - `cursoAprobado` = test final superado.
8. **Orden de respuestas** (`shuffle.ts`): barajado determinista por intento (semilla = id del
   intento), para que el orden no cambie al recargar la pantalla.
9. **Presets de demo** (`demo-presets.ts`): «Inicio» (sin progreso), «Capítulo 2 a medias»
   (cap. 1 superado, 2 de 4 materiales vistos, como en los mockups) y «Curso aprobado». Se
   aplican desde Perfil (spec 03) para enseñar cualquier estado sin recorrer todo el flujo.

## Technical decision

- **Reglas como funciones puras** separadas del almacenamiento: se testean sin DOM y se podrán
  ejecutar igual en el backend.
- **`localStorage` + `useSyncExternalStore`** en lugar de una librería de estado o de React Query:
  el volumen es mínimo; al llegar la API se valorará TanStack Query en otra spec.
- **Capa `api/` asíncrona desde ya**, aunque los datos sean locales, para que las pantallas
  gestionen estados de carga y error reales.

## Affected files

Los del frontmatter; `docs/stack.md` añade la sección «Datos y progreso» al cerrar.

## Tests

- `rules.test.ts`: desbloqueo en orden; test bloqueado con materiales pendientes;
  `aciertosNecesarios(5, 80) = 4`, `(15, 80) = 12`; corrección 3/5 → 60 % no superado, 4/5 →
  80 % superado; falladas con su explicación; progreso 1/6 = 17 %.
- `progress-store.test.ts`: persistencia, reinicio con JSON corrupto, presets.
- `cursos.test.ts`: `getCapitulo` de un capítulo bloqueado lanza `Bloqueado`; `login` con
  credenciales erróneas lanza `CredencialesInvalidas`.

## Acceptance criteria

- [x] El seed reproduce exactamente las preguntas, respuestas y explicaciones del contenido de ejemplo (`seed.test.ts` lo compara con el markdown).
- [x] Todas las reglas de `decisiones.md` §3–§4 están cubiertas por tests y en verde.
- [x] El progreso sobrevive a recargar la página y se reinicia al aplicar un preset.
- [x] Ninguna pantalla importa `mocks/` directamente; solo `api/` y los stores (`arquitectura.test.ts`).

## Implementation notes

- **`createLocalStore`** (`src/lib/local-store.ts`): utilidad común para sesión, progreso y
  cuentas: JSON versionado en `localStorage`, validación al leer (si falla, valor inicial),
  instantánea cacheada para `useSyncExternalStore`, sincronización entre pestañas (`storage`) y
  copia en memoria si `localStorage` no está disponible.
- **Claves:** `sgg-lms:v1:sesion`, `sgg-lms:v1:progreso` y `sgg-lms:v1:cuentas` (contraseña
  cambiada y primer acceso completado, lo que guardaría el backend).
- **Cuenta demo:** `lucia.fernandez@email.com` / `provisional`. El email no distingue mayúsculas
  ni espacios.
- **`api/`** comprueba sesión, curso asignado y desbloqueo como lo haría el backend
  (`NoAutenticado`, `NoEncontrado`, `Bloqueado`, `CredencialesInvalidas`,
  `ContrasenaActualIncorrecta`). Latencia de 200–400 ms salvo en tests.
- **Presets de demo** en `src/mocks/demo-presets.ts`, expuestos a las pantallas por `api/demo.ts`
  (`aplicarPreset`, `reiniciarDemo`) para respetar la regla de no importar `mocks/`. «Curso
  aprobado» da por superados de forma sintética los capítulos 3–5 (sin preguntas) y aprueba el
  test final con 9 de 10.
- **Capítulos con contenido pendiente:** pueden estar «en curso» pero su test nunca se
  desbloquea, así que el alumno no avanza más allá hasta que se publiquen.
- **Materiales del seed** con rutas definitivas y `tamanoBytes: 0` (provisional): la spec 04
  genera los archivos y ajusta tamaños, páginas y duraciones.
- **`tsconfig.test.json`:** los tests usan tipos de Node (`node:fs`) sin que entren en el código
  de la app.

