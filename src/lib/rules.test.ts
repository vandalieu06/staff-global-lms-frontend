import { describe, expect, it } from 'vitest'
import { cursoDermoconsejera as curso } from '@/mocks/seed'
import type { IndiceRespuesta, Intento, ProgresoCurso, Test } from '@/types/domain'
import {
  aciertosNecesarios,
  corregir,
  cursoAprobado,
  estadoCapitulo,
  estadosCapitulos,
  estadoTestFinal,
  intentoQueSupero,
  materialesPendientes,
  mejorIntento,
  progresoCurso,
  siguientePaso,
  testDesbloqueado,
} from './rules'
import { barajar, ordenRespuestas } from './shuffle'

const [cap1, cap2, cap3] = curso.capitulos

/** Respuestas con `fallos` errores en las primeras preguntas. */
function respuestas(test: Test, fallos = 0): IndiceRespuesta[] {
  return test.preguntas.map((p, i) =>
    i < fallos ? (((p.correcta + 1) % 4) as IndiceRespuesta) : p.correcta,
  )
}

/** Intento corregido. Los capítulos con contenido pendiente (sin preguntas) se dan por superados. */
function intento(test: Test, fallos = 0, id = 'i1'): Intento {
  const c = corregir(test, respuestas(test, fallos))
  const sintetico = test.preguntas.length === 0
  return {
    id,
    testId: test.id,
    fecha: '2026-10-22T00:00:00.000Z',
    respuestas: respuestas(test, fallos),
    aciertos: c.aciertos,
    total: c.total,
    porcentaje: sintetico ? 100 : c.porcentaje,
    superado: sintetico || c.superado,
  }
}

function progreso(parcial: Partial<ProgresoCurso> = {}): ProgresoCurso {
  return { materialesVistos: [], intentos: {}, ...parcial }
}

const todosSuperados = () =>
  progreso({
    materialesVistos: curso.capitulos.flatMap((c) => c.materiales.map((m) => m.id)),
    intentos: Object.fromEntries(curso.capitulos.map((c) => [c.test.id, [intento(c.test)]])),
  })

describe('aciertosNecesarios', () => {
  it.each([
    [5, 80, 4],
    [15, 80, 12],
    [10, 80, 8],
    [3, 80, 3],
    [5, 50, 3],
  ])('%i preguntas al %i %% → %i aciertos', (n, nota, esperado) => {
    expect(aciertosNecesarios(n, nota)).toBe(esperado)
  })
})

describe('corregir', () => {
  it('3 de 5 → 60 %, no superado, con las 2 falladas y su explicación', () => {
    const c = corregir(cap2.test, respuestas(cap2.test, 2))

    expect(c).toMatchObject({ aciertos: 3, total: 5, porcentaje: 60, superado: false, necesarios: 4 })
    expect(c.falladas.map((f) => f.pregunta.id)).toEqual(['cap-2-p1', 'cap-2-p2'])
    expect(c.falladas[0].pregunta.explicacion).toMatch(/15 kg/)
    expect(c.falladas[0].elegida).not.toBe(c.falladas[0].pregunta.correcta)
    expect(c.acertadas).toHaveLength(3)
  })

  it('4 de 5 → 80 %, superado', () => {
    expect(corregir(cap2.test, respuestas(cap2.test, 1))).toMatchObject({
      aciertos: 4,
      porcentaje: 80,
      superado: true,
    })
  })

  it('rechaza un número de respuestas distinto al de preguntas', () => {
    expect(() => corregir(cap2.test, [0, 0])).toThrow()
  })
})

describe('capítulos', () => {
  it('sin progreso: el 1 en curso y el resto bloqueados', () => {
    expect([...estadosCapitulos(curso, progreso()).values()]).toEqual([
      'en-curso',
      'bloqueado',
      'bloqueado',
      'bloqueado',
      'bloqueado',
    ])
  })

  it('al superar el 1, el 2 pasa a en curso', () => {
    const p = progreso({ intentos: { [cap1.test.id]: [intento(cap1.test)] } })

    expect(estadoCapitulo(curso, p, 'cap-1')).toBe('superado')
    expect(estadoCapitulo(curso, p, 'cap-2')).toBe('en-curso')
    expect(estadoCapitulo(curso, p, 'cap-3')).toBe('bloqueado')
  })

  it('un suspenso no supera el capítulo', () => {
    const p = progreso({ intentos: { [cap1.test.id]: [intento(cap1.test, 2)] } })
    expect(estadoCapitulo(curso, p, 'cap-1')).toBe('en-curso')
  })
})

describe('testDesbloqueado', () => {
  it('bloqueado con 2 de 4 materiales vistos', () => {
    const p = progreso({ materialesVistos: ['cap-2-pdf', 'cap-2-imagen'] })

    expect(materialesPendientes(cap2, p)).toBe(2)
    expect(testDesbloqueado(cap2, p)).toBe(false)
  })

  it('desbloqueado con los 4 vistos', () => {
    const p = progreso({ materialesVistos: cap2.materiales.map((m) => m.id) })
    expect(testDesbloqueado(cap2, p)).toBe(true)
  })

  it('nunca en un capítulo con contenido pendiente', () => {
    expect(testDesbloqueado(cap3, progreso())).toBe(false)
  })
})

describe('progreso del curso', () => {
  it('capítulo 1 superado → 1 de 6 (17 %)', () => {
    const p = progreso({ intentos: { [cap1.test.id]: [intento(cap1.test)] } })
    expect(progresoCurso(curso, p)).toEqual({ superados: 1, total: 6, porcentaje: 17 })
  })

  it('test final bloqueado hasta superar todos los capítulos', () => {
    expect(estadoTestFinal(curso, progreso())).toBe('bloqueado')
    expect(estadoTestFinal(curso, todosSuperados())).toBe('disponible')
    expect(siguientePaso(curso, todosSuperados())).toEqual({ tipo: 'test-final' })
  })

  it('superar el test final aprueba el curso', () => {
    const p = todosSuperados()
    p.intentos[curso.testFinal.id] = [intento(curso.testFinal, 1)]

    expect(cursoAprobado(curso, p)).toBe(true)
    expect(estadoTestFinal(curso, p)).toBe('superado')
    expect(progresoCurso(curso, p)).toEqual({ superados: 6, total: 6, porcentaje: 100 })
    expect(siguientePaso(curso, p)).toEqual({ tipo: 'aprobado' })
  })

  it('siguiente paso: el capítulo en curso', () => {
    const p = progreso({ intentos: { [cap1.test.id]: [intento(cap1.test)] } })
    expect(siguientePaso(curso, p)).toEqual({ tipo: 'capitulo', capitulo: cap2 })
  })
})

describe('intentos', () => {
  const p = progreso({
    intentos: {
      [cap2.test.id]: [
        intento(cap2.test, 2, 'a'),
        intento(cap2.test, 0, 'b'),
        intento(cap2.test, 1, 'c'),
      ],
    },
  })

  it('mejor intento: el de mayor nota', () => {
    expect(mejorIntento(p, cap2.test.id)?.id).toBe('b')
  })

  it('intento que superó: el primero con aprobado, numerado desde 1', () => {
    expect(intentoQueSupero(p, cap2.test.id)).toMatchObject({ numero: 2, intento: { id: 'b' } })
  })
})

describe('orden de respuestas', () => {
  it('es una permutación de las 4 respuestas', () => {
    expect([...ordenRespuestas('x', 'p1')].sort()).toEqual([0, 1, 2, 3])
  })

  it('es estable para el mismo intento y pregunta', () => {
    expect(ordenRespuestas('intento-1', 'cap-2-p1')).toEqual(ordenRespuestas('intento-1', 'cap-2-p1'))
  })

  it('no deja siempre la correcta en primer lugar', () => {
    const primeras = Array.from({ length: 20 }, (_, i) => ordenRespuestas(`i${i}`, 'p')[0])
    expect(new Set(primeras).size).toBeGreaterThan(1)
  })

  it('barajar no modifica la entrada', () => {
    const entrada = [1, 2, 3, 4, 5]
    barajar(entrada, 's')
    expect(entrada).toEqual([1, 2, 3, 4, 5])
  })
})
