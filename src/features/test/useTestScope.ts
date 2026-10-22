import { useParams } from 'react-router'

/**
 * Ámbito del test según la ruta: el de un capítulo (`/cursos/:c/capitulos/:cap/test…`) o el test
 * final del curso (`/cursos/:c/test-final…`). Devuelve también la ruta base y la de salida.
 */
export function useTestScope() {
  const { cursoId = '', capituloId } = useParams()
  const isFinal = capituloId === undefined
  const base = isFinal
    ? `/cursos/${cursoId}/test-final`
    : `/cursos/${cursoId}/capitulos/${capituloId}/test`
  const exitTo = isFinal ? `/cursos/${cursoId}` : `/cursos/${cursoId}/capitulos/${capituloId}`

  return { cursoId, capituloId, isFinal, base, exitTo }
}
