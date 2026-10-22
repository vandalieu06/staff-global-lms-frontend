# AGENTS.md — Staff Global LMS

Web app de formación móvil de Staff Global Group: cursos → capítulos (materiales + test con nota
mínima), acceso por invitación. Versión actual: **0.1.0**, prototipo con datos mock y sin backend.

## Dónde está cada cosa

| Necesitas… | Lee |
| --- | --- |
| Qué es el producto y su alcance | `docs/brief.md` |
| Reglas de negocio (desbloqueo, tests, acceso) | `docs/decisiones.md` |
| Qué hace cada pantalla y el mapa del flujo | `docs/pantallas.md` |
| Stack, versiones y arquitectura | `docs/stack.md` |
| Colores, tipografía, componentes | `DESIGN.md` |
| Datos de ejemplo (formación real) | `docs/contenido-ejemplo/` |
| Plan y specs de la versión en curso | `specs/0.1.0/README.md` |
| Mockups | https://claude.ai/artifact/LVgAGm6TCGkMxiEMvK14vW |

`docs/` y `DESIGN.md` mandan sobre cualquier suposición. Si el código y la documentación
discrepan, se para y se pregunta.

## Stack y comandos

Vite + React 19, React Router 8 (`react-router`, **no** `react-router-dom`), shadcn/ui +
Tailwind 4, TypeScript 6, Vitest, **pnpm** (nunca npm ni yarn). Versiones fijadas en
`docs/stack.md`; no se actualizan dependencias sin spec.

`pnpm dev` · `pnpm build` · `pnpm test` · `pnpm lint` · `pnpm typecheck`. Antes de dar una
spec por completada: tests, lint, typecheck y build en verde.

## Convenciones

- **Idioma:** interfaz, documentación, specs y commits en español. Código (identificadores) en
  inglés salvo términos del dominio (`curso`, `capitulo`, `material`, `intento`).
- **Estructura:** pantallas en `src/features/<área>/`; componentes compartidos en
  `src/components/`; componentes shadcn en `src/components/ui/` (se añaden con
  `pnpm dlx shadcn@latest add`, no a mano); alias `@/` → `src/`.
- **Datos:** las pantallas solo usan `src/api/` y los stores de `src/lib/`; nunca importan
  `src/mocks/` directamente. Las reglas de negocio son funciones puras en `src/lib/rules.ts`.
- **UI:** cumplir `DESIGN.md`: color plano (el degradado de marca solo en login y curso
  aprobado), sin sombras en reposo, iconos Lucide, sin emojis, áreas táctiles ≥ 44 px, controles
  nativos accesibles. Diseñar a 390 px.
- **Textos de interfaz** siempre con `t()` de i18next (`src/locales/es.json`).
- **Skills del repo** (`.agents/skills/`): `shadcn` para componentes y tema;
  `design-taste-frontend` para criterio visual; `agent-browser` para revisar en el navegador.
- **Commits:** mensaje en español con prefijo convencional (`feat:`, `fix:`, `docs:`, `chore:`)
  y `(spec NN)` cuando cierran una spec.

## Flujo Spec-Driven Development (SDD) — Obligatorio

1. **Regla de oro:** prohibido crear o modificar código fuente sin una spec APROBADA por el
   usuario. Si llega un cambio sin documentar, el primer paso es escribir/actualizar su spec
   y confirmarla antes de implementar.

2. **Creación de spec:** crea `specs/<version>/NN-tema.md` con este frontmatter YAML (es la
   **fuente de verdad** del estado):

   ```yaml
   ---
   code: "NN"
   title: "Título conciso"
   project: "staff-global-lms"
   status: proposed # proposed | approved | in-progress | completed
   version: "<version>"
   date: YYYY-MM-DD
   tags: [spec, sdd]
   affected_files:
     - lib/...
   ---
   ```

   `project` debe coincidir con el nombre del proyecto. `<version>` usa **semver**
   (p. ej. `0.1.0`) y es la misma que el nombre de la carpeta `specs/<version>/`.

   El cuerpo usa estas secciones: Purpose / Context / Proposed change / Technical decision /
   Affected files / Tests / Acceptance criteria. La spec describe **un** cambio; si supera
   ~300 líneas, divídela en varias specs. El estado completo del sistema vive en `docs/`.

3. **Pausa dura (human-in-the-loop):** al dejar la spec en `status: proposed`, DETÉN la
   ejecución, muestra un resumen y espera confirmación explícita. No pases a `in-progress`
   ni toques código hasta que el usuario apruebe.

4. **Implementación:** con la aprobación, cambia la spec a `status: in-progress` e implementa
   el código y los tests descritos en ella.

5. **Cierre:** cuando los Acceptance criteria estén cumplidos, cambia la spec a
   `status: completed`, actualiza la documentación viva en `docs/` y anota el cambio en
   `specs/<version>/00-changelog.md` (sin hash). Código, spec, docs y changelog van en **un
   solo commit** cuyo mensaje incluye `(spec NN)`; el commit se localiza con
   `git log --grep "spec NN"`.

Los specs se organizan por versión en `specs/<version>/`; los cambios nuevos se registran en
la versión actual (`00-changelog.md`) y al liberar un conjunto se sube la versión de specs
(incrementa el semver). `docs/` es la referencia autoritativa del estado actual; `specs/` es
el contrato/plan por versión.
