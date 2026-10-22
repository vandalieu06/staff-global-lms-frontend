import { useCallback, useState } from 'react'
import {
  descartarIntento,
  guardarIntento,
  leerIntento,
  type IntentoEnCurso,
} from '@/lib/attempt-store'
import type { IndiceRespuesta } from '@/types/domain'

/**
 * Intento en curso de un test: lo lee de `sessionStorage` y guarda cada cambio, para que recargar
 * la página no pierda las respuestas. `null` si no hay intento empezado.
 */
export function useIntento(cursoId: string, testId: string | undefined) {
  const [intento, setIntento] = useState<IntentoEnCurso | null>(() =>
    testId ? leerIntento(cursoId, testId) : null,
  )
  // Si el test llega después del primer render, se lee entonces.
  const [leidoPara, setLeidoPara] = useState(testId)
  if (testId !== leidoPara) {
    setLeidoPara(testId)
    setIntento(testId ? leerIntento(cursoId, testId) : null)
  }

  const actualizar = useCallback(
    (fn: (actual: IntentoEnCurso) => IntentoEnCurso) => {
      setIntento((actual) => {
        if (!actual || !testId) return actual
        const nuevo = fn(actual)
        guardarIntento(cursoId, testId, nuevo)
        return nuevo
      })
    },
    [cursoId, testId],
  )

  const elegir = useCallback(
    (respuesta: IndiceRespuesta) =>
      actualizar((a) => ({
        ...a,
        respuestas: a.respuestas.map((r, i) => (i === a.indice ? respuesta : r)),
      })),
    [actualizar],
  )

  const avanzar = useCallback(() => actualizar((a) => ({ ...a, indice: a.indice + 1 })), [actualizar])

  const descartar = useCallback(() => {
    if (testId) descartarIntento(cursoId, testId)
  }, [cursoId, testId])

  return { intento, elegir, avanzar, descartar }
}
