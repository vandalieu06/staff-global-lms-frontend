import type { IndiceRespuesta } from '@/types/domain'

/** Hash FNV-1a de 32 bits: convierte la semilla de texto en un número. */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Generador pseudoaleatorio mulberry32: misma semilla, misma secuencia. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Baraja (Fisher-Yates) de forma determinista según la semilla. No modifica la entrada. */
export function barajar<T>(items: readonly T[], semilla: string): T[] {
  const random = mulberry32(hash(semilla))
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/**
 * Orden en que se muestran las 4 respuestas de una pregunta en un intento. Devuelve los índices
 * originales en el orden de pantalla; es estable para el mismo intento (sobrevive a recargar).
 */
export function ordenRespuestas(intentoId: string, preguntaId: string): IndiceRespuesta[] {
  return barajar<IndiceRespuesta>([0, 1, 2, 3], `${intentoId}:${preguntaId}`)
}
