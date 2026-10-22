# DESIGN.md — Staff Global LMS

Sistema visual de la web app. Es la referencia para mockups e implementación (shadcn/ui +
Tailwind). Si un componente necesita algo que no está aquí, se añade aquí primero.

Mockups de referencia: https://claude.ai/artifact/LVgAGm6TCGkMxiEMvK14vW
Decisiones y comportamiento: [`docs/decisiones.md`](docs/decisiones.md) · [`docs/pantallas.md`](docs/pantallas.md)

## Principios

1. **Móvil primero.** Se diseña a 390×844; el escritorio es una columna centrada (máx. ~480 px).
2. **Una acción principal por pantalla**, en morado de marca y en color plano.
3. **El color está en el progreso y el estado**, no en el decorado: morado = avance o acción,
   verde = superado, rojo = fallado, gris = bloqueado.
4. **Superficies planas.** Se separan con un borde de 1 px o un cambio de tono; sin sombras en reposo.
5. **Accesible tal cual se dibuja**: contraste AA, áreas táctiles de 44 px y controles nativos.

## Color

### Marca (Staff Global Group)

| Token | Hex | Uso |
| --- | --- | --- |
| `brand-purple` | `#8646b9` | Botón principal, progreso, paso en curso, enlaces, pestaña activa |
| `brand-violet` | `#6a53bc` | Parada del degradado |
| `brand-slate` | `#585ec1` | Parada del degradado |
| `brand-cobalt` | `#3a6ddc` | Parada del degradado |
| `brand-blue` | `#2976c6` | Extremo del degradado |
| `brand-50` | `#f4edfb` | Fondo de selección (respuesta elegida, pestaña activa, avisos informativos) |
| `brand-100` | `#e5d4f5` | Avatar, anillo de foco |
| `brand-200` | `#cba9eb` | Borde de tarjeta activa (capítulo en curso, siguiente capítulo) |
| `brand-800` | `#5b2d85` | Texto sobre `brand-50` / `brand-100` |

**Degradado de marca:** `linear-gradient(90deg, #8646b9, #2976c6)`. Solo se usa en **dos
momentos**: la cabecera del login y la pantalla de curso aprobado. No va en botones, tarjetas,
barras ni textos.

### Neutros (Tailwind gray)

| Token | Hex | Uso |
| --- | --- | --- |
| `gray-900` | `#111827` | Títulos y texto principal |
| `gray-700` | `#374151` | Texto de párrafo |
| `gray-500` | `#6b7280` | Texto secundario y metadatos (mín. 12 px) |
| `gray-400` | `#9ca3af` | Borde de radio sin marcar, placeholders (no para texto legible) |
| `gray-300` | `#d1d5db` | Borde de inputs y botón secundario |
| `gray-200` | `#e5e7eb` | Borde de tarjetas, divisor de barra inferior |
| `gray-100` | `#f3f4f6` | Divisores internos, pista de barras de progreso, estado bloqueado |
| `gray-50` | `#f9fafb` | Fondo de página |
| `white` | `#ffffff` | Tarjetas, cabeceras, barras inferiores |

### Estado

| Estado | Fondo | Texto/icono | Borde | Uso |
| --- | --- | --- | --- | --- |
| Superado / correcto | `green-50 #f0fdf4` · `green-100 #dcfce7` | `green-900 #14532d` · icono `green-600 #16a34a` | — | Capítulo superado, respuesta correcta, test aprobado |
| Barra de aprobado | — | `green-600 #16a34a` | — | Barra de nota superada |
| Paso superado | `green-700 #15803d` | blanco | — | Punto del temario |
| Fallado / error | `red-50 #fef2f2` · `red-100 #fee2e2` | `red-900 #7f1d1d` · icono `red-600 #dc2626` | `red-200 #fecaca` | Respuesta incorrecta, error de formulario, cerrar sesión |
| Barra de suspenso | — | `red-500 #ef4444` | — | Barra de nota no superada |
| Bloqueado | `gray-100` | `gray-500` | — | Capítulos y test bloqueados, botón deshabilitado |

> La paleta original incluía estados de otro producto (prioridades, promo, placement, precio,
> GPS). No aplican al LMS y no forman parte de este sistema.

### Variables shadcn/ui (`globals.css`)

```css
:root {
  --background: #f9fafb;        /* gray-50 */
  --foreground: #111827;        /* gray-900 */
  --card: #ffffff;
  --card-foreground: #111827;
  --popover: #ffffff;
  --popover-foreground: #111827;
  --primary: #8646b9;           /* brand-purple */
  --primary-foreground: #ffffff;
  --secondary: #f4edfb;         /* brand-50 */
  --secondary-foreground: #5b2d85;
  --muted: #f3f4f6;             /* gray-100 */
  --muted-foreground: #6b7280;  /* gray-500 */
  --accent: #f4edfb;
  --accent-foreground: #5b2d85;
  --destructive: #dc2626;
  --border: #e5e7eb;            /* gray-200 */
  --input: #d1d5db;             /* gray-300 */
  --ring: #8646b9;
  --radius: 0.625rem;           /* 10 px */

  --success: #16a34a;
  --success-foreground: #14532d;
  --success-muted: #dcfce7;

  --brand-gradient: linear-gradient(90deg, #8646b9, #2976c6);
}
```

Modo oscuro: fuera de alcance en esta versión.

## Tipografía

- **Familia:** Inter (`font-sans`; fallback `ui-sans-serif, system-ui, -apple-system`). Una sola familia; sin monoespaciada.
- **Pesos:** 700 títulos · 600 subtítulos, botones y etiquetas de estado · 500 etiquetas de campo · 400 texto.
- **Mayúsculas:** siempre en minúscula normal (*sentence case*). No se usan etiquetas en mayúsculas con espaciado amplio.

| Rol | Tamaño / interlineado | Peso | Tracking | Ejemplo |
| --- | --- | --- | --- | --- |
| Cifra de resultado | 40 / 1 | 700 | -0.02em | «60 %» |
| Título de pantalla destacado | 28 / 1.15 | 700 | -0.02em | «Dermoconsejera», «Test del capítulo» |
| Título de pantalla | 24 / 1.2 | 700 | -0.01em | «Mis cursos», título de capítulo |
| Enunciado de pregunta | 19 / 1.4 | 700 | -0.01em | Pregunta del test |
| Título de sección | 17 / 1.3 | 700 | 0 | «Temario», «Materiales» |
| Cuerpo / opciones | 15 / 1.45–1.55 | 400–600 | 0 | Respuestas, filas |
| Cuerpo secundario | 14 / 1.5 | 400 | 0 | Descripciones |
| Metadatos | 13 / 1.4 | 400–500 | 0 | «PDF · 12 páginas · 2,4 MB» |
| Etiqueta mínima | 12 / 1.3 | 500–600 | 0 | Etiqueta de campo, barra inferior |

Nada por debajo de 12 px.

## Espaciado, radios y elevación

- **Escala:** múltiplos de 2 y 4 px (4, 6, 8, 10, 12, 14, 16, 20, 24).
- **Márgenes laterales:** 20 px en contenido, 8 px en cabeceras con botón de icono.
- **Separación entre secciones:** 22–24 px; dentro de una sección: 8–14 px.
- **Radios:** 10 px botones e inputs · 12 px tarjetas y filas · 14 px tarjetas principales · 999 px avatares, puntos y etiquetas.
- **Elevación:** sin sombras en reposo. Solo flotan los diálogos, menús y hojas (`shadow-lg`). Excepción: la página del visor de PDF lleva una sombra mínima para separarla del fondo gris.

## Iconos

- Set **Lucide** (el de shadcn), trazo 2, en línea.
- Tamaños: 22 px navegación y cabeceras · 18 px en filas · 14–16 px dentro de etiquetas.
- En gris (`gray-500`) por defecto; en color solo cuando marcan estado (check verde, X roja, material pendiente en morado).
- Sin iconos dentro de cuadrados o círculos de color; sin emojis.
- Botones de solo icono con `aria-label`.

## Componentes

| Componente | Especificación | shadcn |
| --- | --- | --- |
| **Botón principal** | 48–50 px de alto, ancho completo, `primary`, texto 15–16/600, radio 10 | `Button` |
| **Botón secundario** | Igual de alto, fondo blanco, borde `gray-300` (o `brand-200` con texto `brand-800`) | `Button variant="outline"` |
| **Botón de texto** | 44 px de alto, texto `primary` 15/600 | `Button variant="link"` |
| **Botón deshabilitado** | Fondo `gray-100`, texto `gray-500`, texto que explica por qué («Abre los 2 materiales pendientes») | `Button disabled` |
| **Input** | 48 px, borde `gray-300`, radio 10, texto 16 px (evita el zoom en iOS), etiqueta 14/500 encima. Foco: borde `primary` + anillo de 3 px `brand-100` | `Input`, `Label`, `Form` |
| **Tarjeta** | Blanca, borde `gray-200`, radio 12–14, padding 16–20 | `Card` |
| **Tarjeta activa** | Borde `brand-200` | `Card` |
| **Etiqueta de estado** | 22–24 px de alto, fondo tenue + texto oscuro del mismo tono, 12–13/600 | `Badge` |
| **Barra de progreso** | 6–8 px, pista `gray-100`, relleno `primary` (o verde/rojo en resultados) con marca vertical de la nota mínima | `Progress` |
| **Progreso del test** | Segmentos de 6 px, uno por pregunta, `primary` hechos / `gray-200` pendientes | propio |
| **Respuesta de test** | Fila con radio de 22 px, borde `gray-200`, radio 12, padding 14. Seleccionada: fondo `brand-50`, borde `primary` doble | `RadioGroup` en `fieldset` |
| **Temario (stepper)** | Punto de 36 px + línea de 2 px. Superado: verde con check · en curso: morado con número y tarjeta `brand-200` · bloqueado: gris con candado | propio |
| **Fila de material** | Icono de tipo, título 15/600, metadatos 13 px con «Visto» en verde o «Pendiente» en morado y botón de descarga de 44 px | propio + `Button` |
| **Cabecera** | 56–64 px. Raíz: título 24/700. Detalle: botón volver/cerrar de 44 px + contexto 15/600 | propio |
| **Barra inferior** | 72 px, blanca, borde superior `gray-200`, 2 destinos. Activo: icono en píldora `brand-50` y texto `primary` 600 | propio |
| **Barra de acción fija** | Pie blanco con borde superior, padding 12/20/20, contiene el botón principal | propio |
| **Avisos** | Radio 10, padding 12–14, icono 18 px + texto 14 px. Info `brand-50`/`brand-800`, éxito `green-100`/`green-900` | `Alert` |
| **Avatar** | Círculo `brand-100` con iniciales `brand-800` 700 | `Avatar` |
| **Diálogos** | Confirmar salida del test y cierre de sesión | `AlertDialog` |
| **Plegables** | Preguntas acertadas en el resultado | `Accordion` |

## Accesibilidad

- Contraste AA: texto ≥ 4,5:1 (`#8646b9` sobre blanco ≈ 5,8:1; `gray-500` sobre `gray-50` ≈ 4,6:1).
- Áreas táctiles ≥ 44×44 px.
- Formularios con `label` asociado; las respuestas del test en `fieldset` con `legend`.
- Barras de progreso con `role="progressbar"` y valores; visor de vídeo y audio con `slider` accesible.
- El estado nunca se comunica solo con color: siempre hay icono o texto («Superado», «Tu respuesta»).
