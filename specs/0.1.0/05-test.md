---
code: "05"
title: "Test del capítulo y del curso"
project: "staff-global-lms"
status: completed # proposed | approved | in-progress | completed
version: "0.1.0"
date: 2026-10-22
tags: [spec, sdd, pantallas, test]
affected_files:
  - src/features/test/TestInicioPage.tsx
  - src/features/test/TestIntentoPage.tsx
  - src/features/test/TestResultadoPage.tsx
  - src/features/test/CursoAprobadoPage.tsx
  - src/features/test/QuestionStepper.tsx
  - src/features/test/AnswerOption.tsx
  - src/features/test/ScoreBar.tsx
  - src/features/test/FalladaCard.tsx
  - src/features/test/useIntento.ts
  - src/features/test/useTestScope.ts
  - src/lib/attempt-store.ts
  - src/app/router.test.tsx
  - src/test/arquitectura.test.ts
  - src/components/ScreenPlaceholder.tsx (eliminado)
  - docs/stack.md
  - specs/0.1.0/README.md
  - specs/0.1.0/00-changelog.md
  - src/locales/es.json
  - src/features/test/test.test.tsx
  - docs/pantallas.md
  - docs/decisiones.md
---

# 05 · Test del capítulo y del curso

## Purpose

Implementar el test (pantallas 4.1–4.5) para capítulos y para el test final: condiciones,
preguntas paso a paso, corrección, resultado con las falladas y cierre del curso.

## Context

- Comportamiento en [`docs/pantallas.md`](../../docs/pantallas.md) §4 y reglas en
  [`docs/decisiones.md`](../../docs/decisiones.md) §4.
- La corrección y el cálculo de nota ya existen en `lib/rules.ts` (spec 02).
- Depende de 02 y 04 (el test se desbloquea con los materiales vistos).

## Proposed change

1. **4.1 Inicio** (`…/test` y `/cursos/:c/test-final`): datos clave (preguntas, nota mínima y
   aciertos necesarios, intentos ilimitados, sin tiempo), reglas y último intento si existe.
   Si el test no está desbloqueado → vuelve al capítulo. «Empezar test» crea un intento nuevo.
2. **4.2 Pregunta** (`…/intento`): progreso segmentado, enunciado como `legend` y 4 respuestas
   en `RadioGroup` (orden barajado del intento). «Siguiente» se activa al elegir; en la última
   pasa a «Ver resultado». Sin «Anterior». Las respuestas en curso viven en `sessionStorage`
   (sobreviven a recargar, no a cerrar la pestaña). «Salir» abre `AlertDialog` y descarta el
   intento. El botón atrás del navegador no retrocede preguntas: lleva a la confirmación de salida.
3. **Envío**: `api.enviarIntento` corrige con `rules.corregir`, guarda el intento en el progreso
   y navega a resultado (con `replace`, para que «atrás» no vuelva a la última pregunta).
4. **4.3 / 4.4 Resultado** (`…/resultado`): etiqueta de estado, porcentaje, «X de N correctas»,
   `ScoreBar` con marca de la nota mínima.
   - No superado: «Preguntas falladas · K» con `FalladaCard` (enunciado, tu respuesta, correcta,
     explicación) y «Preguntas acertadas · J» en `Accordion` plegado. Acciones: «Repasar
     materiales» y «Repetir test».
   - Superado: intento en que se superó, siguiente capítulo desbloqueado (o test final), progreso
     del curso y «Empezar capítulo N+1». Si hubo falladas, también se listan plegadas
     (propuesta pendiente de confirmar en `decisiones.md`).
5. **4.5 Curso aprobado** (`/cursos/:c/aprobado`): tras superar el test final; cabecera con
   `--brand-gradient`, nota del test final y capítulos superados; el curso pasa a «Aprobados».
6. **Capítulo ya superado**: su tarjeta muestra la nota y permite repasar materiales. Repetir el
   test queda **desactivado** hasta confirmar la decisión (pendiente en `decisiones.md` §8).

## Technical decision

- Un único conjunto de pantallas para test de capítulo y test final, parametrizado por la ruta.
- Intento en curso en `sessionStorage` y resultado definitivo en el progreso (`localStorage`):
  un test a medias no cuenta como intento.
- Navegación con `replace` en los pasos del test para que el historial no permita cambiar
  respuestas ya enviadas.

## Affected files

Los del frontmatter. `docs/decisiones.md` registra lo que se confirme sobre falladas al aprobar y
repetir tests superados.

## Tests

- `test.test.tsx`:
  - 3 de 5 → 60 %, «No superado», 2 falladas con su explicación, acertadas plegadas.
  - 4 de 5 → 80 %, «Capítulo superado», el capítulo siguiente pasa a «en curso».
  - «Siguiente» deshabilitado sin respuesta; no existe acción para volver a la pregunta anterior.
  - «Salir» con confirmación descarta el intento (el contador de intentos no cambia).
  - Repetir tras suspender crea el intento 2 sin espera.
  - Superar el test final lleva a 4.5 y el curso aparece en «Aprobados».

## Acceptance criteria

- [ ] El flujo completo del capítulo 2 (materiales → test → suspenso → repetir → aprobado →
      capítulo 3 desbloqueado) funciona en un móvil real. *(Recorrido completo hecho con
      `agent-browser` a 390 px; queda la prueba en un móvil físico.)*
- [x] El test final cierra el curso y lo mueve a Aprobados.
- [x] Las pantallas coinciden con los mockups 4.1–4.5 a 390 px.
- [x] Las respuestas se pueden elegir con teclado y lector de pantalla (fieldset/legend/radio).
- [x] Tests en verde (104).

## Implementation notes

- **Intento en curso** en `sessionStorage` (`src/lib/attempt-store.ts`, clave
  `sgg-lms:v1:intento:<curso>:<test>`): pregunta actual y respuestas; se borra al enviar o al salir.
  Recargar mantiene la pregunta y la respuesta marcada.
- **Salir sin perder el control:** `useBlocker` de React Router intercepta cualquier navegación
  durante el intento (la X, el botón atrás, enlaces) y muestra el `AlertDialog` de salida.
- **Las preguntas avanzan en estado, no en la URL** (`/intento` es una sola ruta): así el botón
  atrás nunca vuelve a una pregunta ya respondida.
- **Resultado** a partir del último intento guardado en el progreso, recorregido con
  `rules.corregir` (no se guarda la corrección, solo las respuestas). El test final superado va
  directo a 4.5.
- **Accesibilidad:** cada pregunta es un `fieldset` con `legend`; el `RadioGroup` se etiqueta con el
  enunciado; al pasar de pregunta el foco va al enunciado; el progreso segmentado tiene
  `role="progressbar"` con texto «Pregunta N de M».
- **Fixtures en tests:** el test de arquitectura permite ahora que los archivos `*.test.tsx`
  importen `@/mocks` (datos de ejemplo como fixtures); el código de las pantallas sigue sin poder.
- **Limpieza:** eliminado `ScreenPlaceholder` y las claves de i18n que solo usaban las pantallas
  provisionales.

