import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { getCurso, NoEncontrado } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { ProgressBar } from '@/components/ProgressBar'
import { useProgreso } from '@/lib/progress-store'
import { progresoCurso } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'
import { CourseStepper } from './CourseStepper'

/** 2.2 Curso · temario (docs/pantallas.md §2.2). */
export function Component() {
  const { t } = useTranslation()
  const { cursoId = '' } = useParams()
  const curso = useAsync(() => getCurso(cursoId), [cursoId])
  const progreso = useProgreso(cursoId)

  return (
    <>
      <AppHeader variant="detail" title={t('course.header')} to="/" />
      {curso.status === 'loading' && <LoadingState />}
      {curso.status === 'error' &&
        (curso.error instanceof NoEncontrado ? (
          <ErrorState message={t('course.notFound')} />
        ) : (
          <ErrorState onRetry={curso.reload} />
        ))}
      {curso.status === 'success' && (
        <main className="flex flex-col gap-[22px] px-5 pt-1 pb-6">
          <section className="flex flex-col gap-2.5">
            <span className="text-[13px] text-muted-foreground">{curso.data.formacion.nombre}</span>
            <h1 className="text-[28px] font-bold tracking-tight">{curso.data.titulo}</h1>
            <p className="text-sm leading-normal text-gray-700">{curso.data.descripcion}</p>
            <Resumen curso={curso.data} progreso={progreso} />
          </section>

          <section>
            <h2 className="mb-3.5 text-[17px] font-bold">{t('course.syllabus')}</h2>
            <CourseStepper curso={curso.data} progreso={progreso} />
          </section>
        </main>
      )}
    </>
  )
}

function Resumen({ curso, progreso }: Parameters<typeof CourseStepper>[0]) {
  const { t } = useTranslation()
  const resumen = progresoCurso(curso, progreso)
  return (
    <div className="mt-1.5 flex flex-col gap-2 rounded-xl border border-border bg-card p-3.5">
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-[13px]">
        <span className="font-semibold">
          {t('courses.progress', { superados: resumen.superados, total: resumen.total })}
        </span>
        <span className="text-muted-foreground">{t('course.unlockHint')}</span>
      </div>
      <ProgressBar value={resumen.porcentaje} label={t('courses.progressLabel')} />
    </div>
  )
}
