import { GraduationCap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router'
import { getCurso } from '@/api'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { StickyFooter } from '@/components/StickyFooter'
import { Button } from '@/components/ui/button'
import { useProgreso } from '@/lib/progress-store'
import { cursoAprobado, estadosCapitulos, mejorIntento } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'

/** 4.5 Curso aprobado (docs/pantallas.md §4.5). Sin certificado: solo confirma el aprobado. */
export function Component() {
  const { t } = useTranslation()
  const { cursoId = '' } = useParams()
  const curso = useAsync(() => getCurso(cursoId), [cursoId])
  const progreso = useProgreso(cursoId)

  if (curso.status === 'loading') return <LoadingState />
  if (curso.status === 'error') return <ErrorState onRetry={curso.reload} />
  if (!cursoAprobado(curso.data, progreso)) return <Navigate to={`/cursos/${cursoId}`} replace />

  const final = mejorIntento(progreso, curso.data.testFinal.id)!
  const superados = [...estadosCapitulos(curso.data, progreso).values()].filter((e) => e === 'superado').length

  return (
    <div className="min-h-dvh bg-card pb-36">
      <section className="flex h-[400px] flex-col justify-end gap-3.5 bg-brand-gradient px-6 pt-6 pb-8 text-white">
        <GraduationCap className="size-11" aria-hidden="true" />
        <h1 className="text-[32px] leading-tight font-bold tracking-tight">{t('approved.title')}</h1>
        <p className="text-[17px] leading-normal text-brand-50">
          {curso.data.titulo} · {curso.data.formacion.nombre}
        </p>
      </section>

      <main className="flex flex-col gap-[18px] px-5 py-6">
        <dl className="grid grid-cols-2 rounded-xl border border-border">
          <div className="flex flex-col gap-0.5 px-4 py-3.5">
            <dt className="text-xs text-muted-foreground">{t('approved.finalTest')}</dt>
            <dd className="text-xl font-semibold">
              {t('approved.finalValue', { nota: final.porcentaje })}{' '}
              <span className="text-sm font-medium text-muted-foreground">
                {t('approved.finalHits', { aciertos: final.aciertos, total: final.total })}
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-gray-100 px-4 py-3.5">
            <dt className="text-xs text-muted-foreground">{t('approved.chapters')}</dt>
            <dd className="text-xl font-semibold">
              {t('approved.chaptersValue', { n: superados, total: curso.data.capitulos.length })}
            </dd>
          </div>
        </dl>
        <p className="text-[15px] leading-relaxed text-gray-700">{t('approved.body')}</p>
      </main>

      <StickyFooter>
        <Button asChild size="touch">
          <Link to="/">{t('approved.toCourses')}</Link>
        </Button>
        <Button asChild variant="link" className="h-11 text-[15px] font-semibold">
          <Link to={`/cursos/${cursoId}`}>{t('approved.toMaterials')}</Link>
        </Button>
      </StickyFooter>
    </div>
  )
}
