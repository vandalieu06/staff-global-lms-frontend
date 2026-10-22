import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { aplicarPreset } from '@/api/demo'
import { cursoDermoconsejera as curso } from '@/mocks/seed'
import {
  getProgreso,
  marcarMaterialVisto,
  registrarIntento,
  reiniciarProgreso,
  useProgreso,
} from './progress-store'
import { estadoCapitulo, materialesPendientes, progresoCurso } from './rules'

const KEY = 'sgg-lms:v1:progreso'

describe('progress-store', () => {
  it('persiste los materiales vistos sin duplicarlos', () => {
    marcarMaterialVisto(curso.id, 'cap-1-pdf')
    marcarMaterialVisto(curso.id, 'cap-1-pdf')

    expect(getProgreso(curso.id).materialesVistos).toEqual(['cap-1-pdf'])
    expect(JSON.parse(localStorage.getItem(KEY)!).cursos[curso.id].materialesVistos).toEqual([
      'cap-1-pdf',
    ])
  })

  it('añade los intentos en orden', () => {
    const base = { testId: 'cap-1-test', fecha: '', respuestas: [], aciertos: 0, total: 5, porcentaje: 0, superado: false }
    registrarIntento(curso.id, { ...base, id: 'a' })
    registrarIntento(curso.id, { ...base, id: 'b' })

    expect(getProgreso(curso.id).intentos['cap-1-test'].map((i) => i.id)).toEqual(['a', 'b'])
  })

  it('se reinicia si el JSON guardado está corrupto', () => {
    localStorage.setItem(KEY, '{no es json')
    expect(getProgreso(curso.id)).toEqual({ materialesVistos: [], intentos: {} })
  })

  it('se reinicia si la versión guardada es otra', () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 0, cursos: { [curso.id]: { materialesVistos: ['x'], intentos: {} } } }))
    expect(getProgreso(curso.id).materialesVistos).toEqual([])
  })

  it('el hook se actualiza al cambiar el progreso y mantiene la referencia si no cambia', () => {
    const { result, rerender } = renderHook(() => useProgreso(curso.id))
    const inicial = result.current
    rerender()
    expect(result.current).toBe(inicial)

    act(() => marcarMaterialVisto(curso.id, 'cap-1-pdf'))
    expect(result.current.materialesVistos).toEqual(['cap-1-pdf'])
  })

  it('reiniciar borra todo el progreso', () => {
    marcarMaterialVisto(curso.id, 'cap-1-pdf')
    reiniciarProgreso()
    expect(getProgreso(curso.id).materialesVistos).toEqual([])
  })
})

describe('presets de demo', () => {
  it('«Capítulo 2 a medias» reproduce el estado de los mockups', () => {
    aplicarPreset('capitulo-2-a-medias')
    const p = getProgreso(curso.id)

    expect(estadoCapitulo(curso, p, 'cap-1')).toBe('superado')
    expect(estadoCapitulo(curso, p, 'cap-2')).toBe('en-curso')
    expect(materialesPendientes(curso.capitulos[1], p)).toBe(2)
    expect(progresoCurso(curso, p).superados).toBe(1)
  })

  it('«Curso aprobado» deja el curso al 100 %', () => {
    aplicarPreset('curso-aprobado')
    expect(progresoCurso(curso, getProgreso(curso.id)).porcentaje).toBe(100)
  })

  it('«Inicio» borra el progreso anterior', () => {
    aplicarPreset('curso-aprobado')
    aplicarPreset('inicio')
    expect(progresoCurso(curso, getProgreso(curso.id)).superados).toBe(0)
  })
})
