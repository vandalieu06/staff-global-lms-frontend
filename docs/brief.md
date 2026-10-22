# Brief — Staff Global LMS

## Qué es

Una **web app de formación** de Staff Global Group, pensada para usarse casi siempre desde el
móvil (≈99 % del uso). Staff crea cursos para que sus usuarios, clientes y empleados se formen
y se evalúen, y así **saber que han leído y entendido** el contenido.

## Cómo se organiza el contenido

```
Formación (ej. DEMO Dermoconsejeras Verano 2026)
└── Curso (ej. Dermoconsejera)
    ├── Capítulo 1 … N   (temario)
    │   ├── Materiales de estudio: PDF, imágenes, vídeo, audio
    │   └── Test del capítulo: preguntas de 4 respuestas, 1 correcta, con nota mínima
    └── Test final del curso
```

- Los capítulos se superan **en orden**: no se abre el siguiente hasta aprobar el test del anterior.
- Para hacer el test hay que haber revisado **todos los materiales** del capítulo.
- Cada test tiene su propia **nota mínima** para aprobar.

## Usuarios

- **Alumno:** recibe una invitación (email + contraseña provisional), cambia la contraseña en el
  primer acceso y solo ve los cursos que tiene asignados.
- **Staff Global Group (administración):** crea cursos, materiales y tests y asigna cursos. Su
  panel queda fuera de este primer flujo.

## Alcance del primer flujo (mockups)

| Área | Pantallas |
| --- | --- |
| Acceso | Login · cambio de contraseña en el primer acceso |
| Inicio | Mis cursos (asignados) · detalle del curso con el temario · perfil |
| Estudio | Capítulo con sus materiales · visores de PDF/imagen, vídeo y audio (con descarga) |
| Evaluación | Inicio del test · pregunta paso a paso · resultado (no superado / superado) · curso aprobado |

## Identidad visual

- Paleta corporativa de Staff Global Group (https://staffglobalgroup.com/), ver [`../DESIGN.md`](../DESIGN.md).
- Referencia de estilo: proyecto *R.I. Mobile — mockups* en Claude Design.
- Componentes base: shadcn/ui. Criterio de diseño: skill `design-taste-frontend`.

## Contenido de ejemplo

Formación real proporcionada por Staff para los mockups:
[contenido-ejemplo/dermoconsejeras-verano-2026.md](contenido-ejemplo/dermoconsejeras-verano-2026.md).

## Ver también

- [decisiones.md](decisiones.md) — reglas confirmadas y supuestos.
- [pantallas.md](pantallas.md) — comportamiento de cada pantalla y mapa del flujo.
