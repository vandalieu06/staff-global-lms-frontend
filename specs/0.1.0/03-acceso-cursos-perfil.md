---
code: "03"
title: "Acceso, Mis cursos y perfil"
project: "staff-global-lms"
status: approved # proposed | approved | in-progress | completed
version: "0.1.0"
date: 2026-10-22
tags: [spec, sdd, pantallas, auth]
affected_files:
  - src/features/auth/LoginPage.tsx
  - src/features/auth/CambioContrasenaPage.tsx
  - src/features/auth/password-schema.ts
  - src/features/auth/RequireSession.tsx
  - src/features/cursos/MisCursosPage.tsx
  - src/features/cursos/CursoPage.tsx
  - src/features/cursos/CourseCard.tsx
  - src/features/cursos/CourseStepper.tsx
  - src/features/perfil/PerfilPage.tsx
  - src/features/perfil/DemoPanel.tsx
  - src/app/router.tsx
  - src/locales/es.json
  - src/features/auth/auth.test.tsx
  - src/features/cursos/cursos.test.tsx
  - docs/pantallas.md
---

# 03 · Acceso, Mis cursos y perfil

## Purpose

Implementar las pantallas 1.1, 1.2, 2.1, 2.2 y 2.3 sobre los datos y reglas de la spec 02, fieles
a los mockups y al `DESIGN.md`.

## Context

- Comportamiento de cada pantalla en [`docs/pantallas.md`](../../docs/pantallas.md) §1–§2.
- Mockups: artboards 1.1, 1.2, 2.1, 2.2 y 2.3 en Claude Design.
- Depende de 01 (rutas, layouts, componentes) y 02 (api, sesión, progreso, reglas).

## Proposed change

1. **1.1 Login** (`/login`): cabecera con `--brand-gradient`, formulario `react-hook-form` + `zod`
   (email válido, contraseña obligatoria), botón mostrar contraseña, selector de idioma
   (solo «Español» activo), enlace «Contacta con tu coordinadora» (`mailto:` provisional).
   Error de credenciales en `Alert`. Redirige a `/primer-acceso` o `/` según `mustChangePassword`.
2. **1.2 Nueva contraseña** (`/primer-acceso` y `/perfil/contrasena`): requisitos en vivo
   (8 caracteres, mayúscula y número, coinciden) con icono y texto; botón activo solo si se
   cumplen. La variante de perfil pide además la contraseña actual y vuelve a `/perfil` con un
   aviso (`sonner`).
3. **Guardas**: `RequireSession` en todas las rutas salvo `/login`.
4. **2.1 Mis cursos** (`/`): secciones «En curso · N» y «Aprobados · N» con `CourseCard`
   (bloque de color plano, descripción, progreso, siguiente paso, «Continuar curso»). Estados:
   carga (esqueleto), vacío sin cursos, vacío en Aprobados.
5. **2.2 Curso** (`/cursos/:cursoId`): cabecera de curso, progreso y `CourseStepper` (superado /
   en curso / bloqueado / test final). Solo los pasos superados o en curso son enlaces; los
   bloqueados no son interactivos y explican qué los abre. Los capítulos con contenido pendiente
   muestran «Contenido pendiente de publicar».
6. **2.3 Perfil** (`/perfil`): datos de solo lectura, resumen asignados/aprobados, cambiar
   contraseña, idioma, cerrar sesión con `AlertDialog`.
7. **Panel de demo** (solo prototipo): sección «Demo» al final de Perfil con los presets de la
   spec 02 y «Reiniciar demo». Visible solo si `import.meta.env.VITE_DEMO === "true"` (activado
   por defecto en `.env`).

## Technical decision

- Validación con **zod** compartida entre las dos variantes de la pantalla de contraseña.
- `CourseStepper` y `CourseCard` como componentes propios con piezas shadcn (`Badge`,
  `Progress`, `Card`), porque shadcn no tiene un *stepper*.
- El panel de demo vive detrás de una variable de entorno para retirarlo sin tocar código.

## Affected files

Los del frontmatter. `docs/pantallas.md` se actualiza al cerrar si cambia algún comportamiento.

## Tests

- `auth.test.tsx`: credenciales erróneas muestran el error; primer acceso redirige a
  `/primer-acceso`; el botón de guardar se activa solo con los 3 requisitos; tras guardar se llega
  a Mis cursos; sin sesión cualquier ruta redirige a `/login`.
- `cursos.test.tsx`: con el preset «Capítulo 2 a medias», Mis cursos muestra «1 de 6 superados»,
  el temario marca el 1 superado, el 2 en curso y del 3 en adelante bloqueados (no enlazables);
  cerrar sesión vuelve a `/login`.

## Acceptance criteria

- [ ] Las 5 pantallas coinciden con los mockups a 390 px (revisión visual lado a lado).
- [ ] El flujo login → nueva contraseña → Mis cursos → Curso funciona en un móvil real.
- [ ] Barra inferior solo en Mis cursos y Perfil; áreas táctiles ≥ 44 px; navegable con teclado.
- [ ] Los presets de demo cambian lo que muestran Mis cursos y Curso sin recargar.
- [ ] Tests en verde.
