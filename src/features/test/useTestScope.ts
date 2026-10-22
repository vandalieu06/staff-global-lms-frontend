import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Bloqueado, getCurso, getTest } from '@/api'
import { useAsync } from '@/lib/use-async'

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

  return { cursoId, capituloId: capituloId ?? null, isFinal, base, exitTo }
}

/**
 * Carga el curso y el test del ámbito actual. Si el test está bloqueado, vuelve a la pantalla de
 * salida con un aviso.
 */
export function useDatosTest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const scope = useTestScope()
  const { cursoId, capituloId, isFinal, exitTo } = scope
  const datos = useAsync(
    () => Promise.all([getCurso(cursoId), getTest(cursoId, capituloId)]),
    [cursoId, capituloId],
  )

  const bloqueado = datos.status === 'error' && datos.error instanceof Bloqueado
  useEffect(() => {
    if (!bloqueado) return
    toast.info(isFinal ? t('test.lockedFinal') : t('test.locked'))
    navigate(exitTo, { replace: true })
  }, [bloqueado, exitTo, isFinal, navigate, t])

  const curso = datos.data?.[0]
  const capitulo = curso?.capitulos.find((c) => c.id === capituloId)
  const contexto = isFinal
    ? t('test.finalContext')
    : capitulo && curso
      ? t('test.chapterContext', { orden: capitulo.orden, total: curso.capitulos.length })
      : ''

  return { ...scope, datos, bloqueado, curso, capitulo, test: datos.data?.[1], contexto }
}
