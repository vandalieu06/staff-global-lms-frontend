import type { IndiceRespuesta, Intento, ProgresoCurso, Test } from '@/types/domain'
import { cursoDermoconsejera as curso } from './seed'

/**
 * Estados de demo para enseñar cualquier pantalla sin recorrer todo el flujo (spec 02). Solo
 * existen en el prototipo.
 */
export type PresetId = 'inicio' | 'capitulo-2-a-medias' | 'curso-aprobado'

export interface Preset {
  id: PresetId
  /** Clave de i18n con el nombre visible. */
  labelKey: `demo.presets.${PresetId}`
  progreso: () => Record<string, ProgresoCurso>
}

const FECHA = '2026-10-20T10:00:00.000Z'

/** Intento sintético con `fallos` respuestas incorrectas (las primeras preguntas). */
function intento(test: Test, fallos = 0, numero = 1): Intento {
  const respuestas = test.preguntas.map<IndiceRespuesta>((p, i) =>
    i < fallos ? (((p.correcta + 1) % 4) as IndiceRespuesta) : p.correcta,
  )
  const total = test.preguntas.length
  const aciertos = total - fallos
  const porcentaje = total === 0 ? 100 : Math.round((aciertos / total) * 100)
  return {
    id: `demo-${test.id}-${numero}`,
    testId: test.id,
    fecha: FECHA,
    respuestas,
    aciertos,
    total,
    porcentaje,
    superado: porcentaje >= test.notaMinima,
  }
}

const [cap1, cap2] = curso.capitulos

export const presets: Preset[] = [
  {
    id: 'inicio',
    labelKey: 'demo.presets.inicio',
    progreso: () => ({}),
  },
  {
    // Como en los mockups: capítulo 1 superado al 100 %, capítulo 2 con 2 de 4 materiales vistos.
    id: 'capitulo-2-a-medias',
    labelKey: 'demo.presets.capitulo-2-a-medias',
    progreso: () => ({
      [curso.id]: {
        materialesVistos: [...cap1.materiales.map((m) => m.id), cap2.materiales[0].id, cap2.materiales[1].id],
        intentos: { [cap1.test.id]: [intento(cap1.test)] },
      },
    }),
  },
  {
    // Todos los capítulos superados (los pendientes, de forma sintética) y test final aprobado.
    id: 'curso-aprobado',
    labelKey: 'demo.presets.curso-aprobado',
    progreso: () => ({
      [curso.id]: {
        materialesVistos: curso.capitulos.flatMap((c) => c.materiales.map((m) => m.id)),
        intentos: {
          ...Object.fromEntries(curso.capitulos.map((c) => [c.test.id, [intento(c.test)]])),
          [curso.testFinal.id]: [intento(curso.testFinal, 1)],
        },
      },
    }),
  },
]
