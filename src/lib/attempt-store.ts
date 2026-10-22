import type { IndiceRespuesta } from '@/types/domain'

/**
 * Intento de test en curso, en `sessionStorage`: sobrevive a recargar la página pero no a cerrar
 * la pestaña, y no cuenta como intento hasta que se envía (spec 05).
 */
export interface IntentoEnCurso {
  id: string
  /** Pregunta que se está respondiendo (0…n-1). */
  indice: number
  /** Respuesta elegida por pregunta, sobre el orden original; `null` si aún no se ha respondido. */
  respuestas: (IndiceRespuesta | null)[]
}

const clave = (cursoId: string, testId: string) => `sgg-lms:v1:intento:${cursoId}:${testId}`

function nuevoId() {
  return globalThis.crypto?.randomUUID?.() ?? `i-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function crearIntento(cursoId: string, testId: string, totalPreguntas: number): IntentoEnCurso {
  const intento: IntentoEnCurso = {
    id: nuevoId(),
    indice: 0,
    respuestas: Array.from({ length: totalPreguntas }, () => null),
  }
  guardarIntento(cursoId, testId, intento)
  return intento
}

export function leerIntento(cursoId: string, testId: string): IntentoEnCurso | null {
  try {
    const raw = sessionStorage.getItem(clave(cursoId, testId))
    if (!raw) return null
    const valor = JSON.parse(raw) as IntentoEnCurso
    return typeof valor.id === 'string' && Array.isArray(valor.respuestas) ? valor : null
  } catch {
    return null
  }
}

export function guardarIntento(cursoId: string, testId: string, intento: IntentoEnCurso) {
  try {
    sessionStorage.setItem(clave(cursoId, testId), JSON.stringify(intento))
  } catch {
    // Sin sessionStorage el intento vive solo en memoria (se pierde al recargar).
  }
}

export function descartarIntento(cursoId: string, testId: string) {
  try {
    sessionStorage.removeItem(clave(cursoId, testId))
  } catch {
    // Nada que borrar.
  }
}
