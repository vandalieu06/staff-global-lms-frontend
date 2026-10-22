import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Bloqueado, getCapitulo, getCurso, NoEncontrado } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { useProgreso } from '@/lib/progress-store'
import { materialesVistos } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'
import { MaterialRow } from './MaterialRow'
import { TestCard } from './TestCard'

/** 3.1 Capítulo · materiales (docs/pantallas.md §3.1). */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cursoId = '', capituloId = '' } = useParams()
  const progreso = useProgreso(cursoId)
  const datos = useAsync(
    () => Promise.all([getCurso(cursoId), getCapitulo(cursoId, capituloId)]),
    [cursoId, capituloId],
  )
  const temario = `/cursos/${cursoId}`

  // Un capítulo bloqueado (p. ej. por URL) vuelve al temario con un aviso.
  const bloqueado = datos.status === 'error' && datos.error instanceof Bloqueado
  useEffect(() => {
    if (!bloqueado) return
    toast.info(t('chapter.locked'))
    navigate(temario, { replace: true })
  }, [bloqueado, navigate, t, temario])

  if (datos.status !== 'success') {
    return (
      <>
        <AppHeader variant="detail" title={t('course.header')} to={temario} />
        {datos.status === 'loading' || bloqueado ? (
          <LoadingState />
        ) : datos.error instanceof NoEncontrado ? (
          <ErrorState message={t('chapter.notFound')} />
        ) : (
          <ErrorState onRetry={datos.reload} />
        )}
      </>
    )
  }

  const [curso, capitulo] = datos.data
  const base = `${temario}/capitulos/${capitulo.id}`

  return (
    <>
      <AppHeader
        variant="detail"
        title={t('chapter.header', { curso: curso.titulo, orden: capitulo.orden, total: curso.capitulos.length })}
        to={temario}
      />
      <main className="flex flex-col gap-[22px] px-5 pt-1 pb-6">
        <section className="flex flex-col gap-2">
          <h1 className="text-2xl leading-tight font-bold tracking-tight">{capitulo.titulo}</h1>
          {!capitulo.contenidoPendiente && (
            <p className="text-sm leading-normal text-gray-700">
              {t('chapter.intro', { count: capitulo.materiales.length })}
            </p>
          )}
        </section>

        {capitulo.contenidoPendiente ? (
          <p className="rounded-xl bg-muted p-4 text-[15px] leading-normal text-gray-700">
            {t('chapter.pendingContent')}
          </p>
        ) : (
          <>
            <section className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-[17px] font-bold">{t('chapter.materials')}</h2>
                <span className="text-[13px] text-muted-foreground">
                  {t('chapter.seenCount', {
                    vistos: materialesVistos(capitulo, progreso),
                    total: capitulo.materiales.length,
                  })}
                </span>
              </div>
              <ul className="divide-y divide-gray-100 rounded-xl border border-border bg-card">
                {capitulo.materiales.map((material) => (
                  <MaterialRow
                    key={material.id}
                    material={material}
                    visto={progreso.materialesVistos.includes(material.id)}
                    to={`${base}/materiales/${material.id}`}
                  />
                ))}
              </ul>
            </section>

            <TestCard capitulo={capitulo} progreso={progreso} to={`${base}/test`} />
          </>
        )}
      </main>
    </>
  )
}
