# Decisiones

Decisiones tomadas para el primer flujo del alumno (mockups del 2026-10-22). Cada una indica de
dónde viene: **Confirmado** (lo decidió el cliente/usuario) o **Supuesto** (lo propuso el diseño y
falta confirmarlo).

## 1. Producto

| Decisión | Origen |
| --- | --- |
| Web app pensada para móvil (≈99 % del uso). Diseño a 390×844. | Confirmado |
| Staff Global Group crea los cursos para que usuarios, clientes y empleados se formen y se evalúen; Staff necesita saber que lo han leído y entendido. | Confirmado |
| Estructura: **Formación → Curso → Capítulos (temario) → Materiales + Test**. | Confirmado |
| El alumno solo ve los **cursos que tiene asignados**. No hay catálogo ni autoinscripción. | Confirmado |
| Idioma principal español; la app es **multidioma** desde el inicio (selector en login y perfil). | Confirmado |

## 2. Acceso

| Decisión | Origen |
| --- | --- |
| **Sin registro público.** El acceso es por invitación: Staff da de alta al usuario y le envía email + contraseña provisional. | Confirmado |
| En el **primer acceso** el usuario debe cambiar la contraseña provisional antes de entrar. | Confirmado |
| Requisitos de contraseña: mínimo 8 caracteres, una mayúscula y un número, y ambas contraseñas deben coincidir. | Supuesto |
| No hay «¿Olvidaste tu contraseña?»; el login enlaza a «Contacta con tu coordinadora». | Supuesto |

## 3. Progresión del curso

| Decisión | Origen |
| --- | --- |
| Los capítulos se superan **en orden**: no se abre el siguiente hasta aprobar el test del anterior. | Confirmado |
| Es **obligatorio revisar todos los materiales** del capítulo para desbloquear su test. | Confirmado |
| Un material cuenta como visto: PDF e imagen al abrirlo; vídeo y audio al llegar al final. | Supuesto |
| Existe un **test final del curso** (15 preguntas) tras superar todos los capítulos. | Supuesto (deducido de «Preguntas del test final: 15» en el [contenido de ejemplo](contenido-ejemplo/dermoconsejeras-verano-2026.md)) |
| Al aprobar el curso solo se indica que está aprobado. **No hay certificado** ni diploma. | Confirmado |
| No hay fecha límite para completar un curso. | Supuesto (no se mencionó) |

## 4. Tests

| Decisión | Origen |
| --- | --- |
| Cada pregunta tiene **4 respuestas y solo 1 correcta**. | Confirmado |
| La **nota mínima depende de cada capítulo** (ej. 80 % en los capítulos 1 y 2). | Confirmado |
| **Intentos ilimitados**, sin tiempo de espera entre intentos. | Confirmado |
| **Sin tiempo límite** para responder. | Confirmado |
| Preguntas paso a paso; **no se puede volver** a la pregunta anterior. | Decidido en diseño (el usuario lo dejó a criterio) |
| El resultado muestra **principalmente las preguntas falladas**: tu respuesta, la correcta y la explicación. Las acertadas quedan plegadas. | Confirmado |
| El orden de las respuestas se mezcla (en el contenido fuente la correcta es siempre la primera). | Supuesto |
| Salir a mitad del test descarta el intento (no se guarda progreso parcial). | Supuesto |

## 5. Navegación

| Decisión | Origen |
| --- | --- |
| **Barra inferior** con dos destinos: *Mis cursos* y *Perfil*. | Confirmado (barra inferior); los dos destinos son Supuesto |
| La barra inferior solo aparece en las pantallas raíz (Mis cursos, Perfil). Las de detalle (curso, capítulo, visores, test) usan cabecera con «volver» o «cerrar» y no la muestran. | Decidido en diseño |
| Los materiales se **previsualizan dentro de la app** y también se pueden **descargar**. | Confirmado |

## 6. Diseño visual

| Decisión | Detalle |
| --- | --- |
| Paleta | Corporativa de Staff Global Group. Acción principal y progreso en `brand-purple #8646b9`; fondos suaves `brand-50 #f4edfb`; bordes activos `brand-200 #cba9eb`. Neutros de Tailwind (`gray-900` títulos, `gray-700` texto, `gray-500` secundario, `gray-50` fondo de página). |
| Degradado de marca | `linear-gradient(90deg, #8646b9 → #2976c6)` usado **solo en dos momentos**: cabecera del login y pantalla de curso aprobado. Botones y tarjetas van en color plano para que la acción principal se lea clara. |
| Estados | Superado/correcto en verde (`green-700` texto sobre `green-100`); fallado en rojo (`red-500`/`red-50`); bloqueado en gris. |
| Tipografía | Inter. Títulos 700, cuerpo 400–500. Sin monoespaciada ni etiquetas en mayúsculas espaciadas. |
| Componentes | Base **shadcn/ui** (ver tabla por pantalla en `pantallas.md`). Radio 10–14 px, bordes 1 px `gray-200`, sin sombras en reposo. |
| Iconos | Línea (estilo Lucide, el set por defecto de shadcn), en gris; sin emojis. |
| Accesibilidad | Áreas táctiles ≥ 44 px, contraste de texto ≥ 4,5:1, controles reales (`button`, `a`, `input` con `label`, `fieldset` para las respuestas). |
| Logo | Pendiente: los mockups usan el nombre «Staff Global Group» como texto hasta tener el logo en SVG. |

## 7. Contenido de ejemplo

Los mockups usan el curso real **Dermoconsejera** (formación *DEMO Dermoconsejeras Verano 2026*) y
las preguntas reales del capítulo 2 de [contenido-ejemplo](contenido-ejemplo/dermoconsejeras-verano-2026.md). Es **contenido de ejemplo** y debe sustituirse
o confirmarse:

- Títulos de los capítulos 3–5 (deducidos de la descripción del curso).
- Títulos, duración y peso de los 4 materiales del capítulo 2 y el texto de la página del PDF.
- Alumna «Lucía Fernández» y su email.
- Notas mostradas: 60 % (suspenso), 100 % (aprobado en el intento 2), 87 % en el test final.

## 8. Pendiente de definir

- Recuperación de contraseña sin coordinadora (¿flujo por email?).
- Qué ve el alumno si un curso no tiene materiales o el test está «en revisión» (en el contenido fuente aparece ese estado para el administrador).
- Idiomas concretos además del español y si el contenido de los cursos también se traduce.
- Notificaciones (curso nuevo asignado, recordatorios).
- Panel de administración de Staff (creación de cursos, seguimiento): fuera de este flujo.
