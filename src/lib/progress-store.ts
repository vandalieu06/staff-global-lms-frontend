import type { Intento, ProgresoCurso } from '@/types/domain'
import { createLocalStore, isRecord } from './local-store'

type ProgresoGuardado = { v: 1; cursos: Record<string, ProgresoCurso> }

const vacio = (): ProgresoGuardado => ({ v: 1, cursos: {} })

const esProgresoCurso = (value: unknown): value is ProgresoCurso =>
  isRecord(value) &&
  Array.isArray(value.materialesVistos) &&
  value.materialesVistos.every((id) => typeof id === 'string') &&
  isRecord(value.intentos) &&
  Object.values(value.intentos).every(Array.isArray)

/**
 * Progreso del alumno por curso, en `localStorage` (clave `sgg-lms:v1:progreso`). Prototipo de un
 * solo alumno por navegador; al conectar el backend el progreso vendrá de la API.
 */
export const progressStore = createLocalStore<ProgresoGuardado>(
  'sgg-lms:v1:progreso',
  vacio,
  (value): value is ProgresoGuardado =>
    isRecord(value) &&
    value.v === 1 &&
    isRecord(value.cursos) &&
    Object.values(value.cursos).every(esProgresoCurso),
)

export const progresoVacio = (): ProgresoCurso => ({ materialesVistos: [], intentos: {} })

export const SIN_PROGRESO: ProgresoCurso = Object.freeze({
  materialesVistos: [],
  intentos: {},
}) as ProgresoCurso

export function getProgreso(cursoId: string): ProgresoCurso {
  return progressStore.get().cursos[cursoId] ?? SIN_PROGRESO
}

/** Hook: progreso de todos los cursos, por id. */
export function useProgresos(): Record<string, ProgresoCurso> {
  return progressStore.use().cursos
}

/** Hook: progreso de un curso (referencia estable mientras no cambie). */
export function useProgreso(cursoId: string): ProgresoCurso {
  return progressStore.use().cursos[cursoId] ?? SIN_PROGRESO
}

function actualizarCurso(cursoId: string, fn: (progreso: ProgresoCurso) => ProgresoCurso) {
  progressStore.update((estado) => ({
    ...estado,
    cursos: { ...estado.cursos, [cursoId]: fn(estado.cursos[cursoId] ?? progresoVacio()) },
  }))
}

export function marcarMaterialVisto(cursoId: string, materialId: string) {
  if (getProgreso(cursoId).materialesVistos.includes(materialId)) return
  actualizarCurso(cursoId, (p) => ({ ...p, materialesVistos: [...p.materialesVistos, materialId] }))
}

export function registrarIntento(cursoId: string, intento: Intento) {
  actualizarCurso(cursoId, (p) => ({
    ...p,
    intentos: { ...p.intentos, [intento.testId]: [...(p.intentos[intento.testId] ?? []), intento] },
  }))
}

/** Sustituye todo el progreso guardado (lo usan los presets de demo). */
export function reemplazarProgreso(cursos: Record<string, ProgresoCurso>) {
  progressStore.set({ v: 1, cursos })
}

export function reiniciarProgreso() {
  progressStore.reset()
}
