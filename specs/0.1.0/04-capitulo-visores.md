---
code: "04"
title: "Capítulo y visores de materiales"
project: "staff-global-lms"
status: approved # proposed | approved | in-progress | completed
version: "0.1.0"
date: 2026-10-22
tags: [spec, sdd, pantallas, materiales]
affected_files:
  - src/features/materiales/CapituloPage.tsx
  - src/features/materiales/MaterialRow.tsx
  - src/features/materiales/TestCard.tsx
  - src/features/materiales/VisorPage.tsx
  - src/features/materiales/PdfViewer.tsx
  - src/features/materiales/ImageViewer.tsx
  - src/features/materiales/VideoPlayer.tsx
  - src/features/materiales/AudioPlayer.tsx
  - src/features/materiales/download.ts
  - src/mocks/seed.ts
  - public/mock/materiales/*
  - scripts/generar-materiales-mock.sh
  - src/locales/es.json
  - src/features/materiales/materiales.test.tsx
  - docs/pantallas.md
---

# 04 · Capítulo y visores de materiales

## Purpose

Implementar las pantallas 3.1–3.4: el capítulo con sus materiales y la tarjeta del test, y los
visores de PDF, imagen, vídeo y audio dentro de la app, con descarga y marca de «visto».

## Context

- Comportamiento en [`docs/pantallas.md`](../../docs/pantallas.md) §3 y reglas de «visto» en
  [`docs/decisiones.md`](../../docs/decisiones.md) §3.
- Aún no hay materiales reales de Staff. Depende de 01 y 02.

## Proposed change

1. **Materiales de muestra** en `public/mock/materiales/`, generados por
   `scripts/generar-materiales-mock.sh` (ffmpeg + Chrome headless, ambos disponibles en local):
   - PDF de 3–4 páginas maquetado desde HTML con el texto de PRL de los mockups.
   - Imagen PNG (infografía sencilla de protección de datos, maquetada en HTML y capturada).
   - Vídeo MP4 H.264 de ~20 s y audio MP3 de ~20 s (cortos para que la demo sea ágil), con una
     tarjeta de título y un tono. Se etiquetan en la interfaz con su duración real.
   - Total < 5 MB. Se sustituirán por los materiales reales cuando Staff los facilite.
2. **3.1 Capítulo** (`/cursos/:c/capitulos/:cap`): título, instrucción, lista de `MaterialRow`
   (icono por tipo, metadatos, «Visto» / «Pendiente», botón de descarga de 44 px) y `TestCard`
   con los tres estados (bloqueado con «Abre los N materiales pendientes», disponible, superado
   con nota). Capítulo bloqueado por URL → redirige al temario con aviso.
3. **Visor** (`…/materiales/:materialId`): cabecera «Material N de M» con cerrar y descargar;
   según el tipo:
   - **PDF** (`react-pdf`): páginas en scroll al ancho de pantalla, paginador «3 / 12» y zoom
     (−/+). Worker de pdf.js servido localmente.
   - **Imagen**: ajustada al ancho, zoom con gesto nativo.
   - **Vídeo**: `<video>` nativo con `playsInline`, controles propios (play/pausa, posición con
     `Slider`, tiempo) y aviso «Se marcará como visto al llegar al final».
   - **Audio**: portada plana de marca, `Slider`, retroceder 15 s, play/pausa, velocidad
     1× / 1,5× / 2×.
   - Pie con «Siguiente material» o, si era el último pendiente, aviso verde y «Ir al test».
4. **Marca de visto**: PDF e imagen al abrirse; vídeo y audio en el evento `ended`.
5. **Descarga**: enlace con atributo `download` al archivo; nombre legible (`titulo.ext`).

## Technical decision

- **`react-pdf`** para el PDF en lugar del visor nativo del navegador: en iOS y Android el PDF
  embebido no funciona igual en todos los navegadores, y se necesita la paginación propia.
- **Controles propios** sobre `<video>`/`<audio>` nativos (sin librería de reproductor) para
  seguir el `DESIGN.md` y controlar el evento de fin.
- **Muestras generadas en local** en lugar de material descargado de internet: sin problemas de
  licencia y reproducibles con el script.

## Affected files

Los del frontmatter. `seed.ts` añade las rutas, tamaños y duraciones de los materiales.

## Tests

- `materiales.test.tsx`: con 2 de 4 vistos, el test aparece bloqueado y el botón deshabilitado;
  abrir el visor de un PDF lo marca como visto; disparar `ended` en el vídeo lo marca; con los 4
  vistos la tarjeta pasa a «Hacer el test»; el botón de descarga apunta al archivo correcto.
- Prueba manual en Safari iOS y Chrome Android: reproducción en línea, PDF legible, descarga.

## Acceptance criteria

- [ ] Los 4 tipos se previsualizan dentro de la app y se pueden descargar.
- [ ] La regla de «visto» se cumple para cada tipo y desbloquea el test al completarse.
- [ ] Las pantallas coinciden con los mockups 3.1–3.4 a 390 px.
- [ ] El script regenera las muestras; el peso total es < 5 MB.
- [ ] Tests en verde.
