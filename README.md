# Staff Global LMS — Frontend

Web app de formación de **Staff Global Group**, pensada para móvil. Los alumnos (usuarios,
clientes y empleados) acceden por invitación, estudian los materiales de cada capítulo (PDF,
imágenes, vídeo y audio) y superan un test por capítulo para avanzar en el curso.

**Estado:** versión 0.1.0 en curso — prototipo navegable con datos mock, sin backend.
Ver [plan y specs](specs/0.1.0/README.md).

## Stack

Vite + React 19 · React Router 8 · shadcn/ui + Tailwind CSS 4 · TypeScript · pnpm.
Versiones y decisiones en [docs/stack.md](docs/stack.md).

## Requisitos

- Node.js ≥ 22.22 (recomendado 24, ver `.nvmrc`)
- pnpm 11 (`corepack enable`)

## Comandos

> Disponibles cuando se implemente la spec 01.

```bash
pnpm install       # dependencias
pnpm dev           # servidor de desarrollo (accesible desde el móvil en la red local)
pnpm build         # build de producción
pnpm preview       # sirve el build
pnpm test          # tests (Vitest)
pnpm lint          # ESLint
pnpm typecheck     # comprobación de tipos
```

## Documentación

| | |
| --- | --- |
| [docs/brief.md](docs/brief.md) | Qué es la app y alcance |
| [docs/decisiones.md](docs/decisiones.md) | Reglas de negocio y decisiones |
| [docs/pantallas.md](docs/pantallas.md) | Mapa del flujo y comportamiento de cada pantalla |
| [docs/stack.md](docs/stack.md) | Stack técnico y arquitectura |
| [DESIGN.md](DESIGN.md) | Sistema visual (paleta, tipografía, componentes) |
| [specs/](specs/) | Specs por versión (flujo SDD) |

Mockups: [Staff Global LMS — mockups](https://claude.ai/artifact/LVgAGm6TCGkMxiEMvK14vW) (Claude Design).

## Cómo se trabaja

El proyecto sigue **Spec-Driven Development**: ningún cambio de código sin una spec aprobada en
`specs/<version>/`. Reglas completas en [AGENTS.md](AGENTS.md).
