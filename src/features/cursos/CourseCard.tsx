import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/button'
import { mejorIntento, progresoCurso, siguientePaso } from '@/lib/rules'
import type { Curso, ProgresoCurso } from '@/types/domain'

type CourseCardProps = { curso: Curso; progreso: ProgresoCurso }

/** Tarjeta de un curso en curso (mockup 2.1): bloque de color, progreso y siguiente paso. */
export function CourseCard({ curso, progreso }: CourseCardProps) {
  const { t } = useTranslation()
  const resumen = progresoCurso(curso, progreso)
  const paso = siguientePaso(curso, progreso)
  const empezado = resumen.superados > 0 || progreso.materialesVistos.length > 0

  return (
    <article className="overflow-hidden rounded-[14px] border border-border bg-card">
      <div className="flex flex-col gap-1.5 bg-primary px-[18px] pt-[18px] pb-5 text-primary-foreground">
        <span className="text-[13px] text-brand-50">{curso.formacion.nombre}</span>
        <h3 className="text-[26px] font-bold tracking-tight">{curso.titulo}</h3>
      </div>
      <div className="flex flex-col gap-3.5 px-[18px] pt-4 pb-[18px]">
        <p className="line-clamp-3 text-sm leading-normal text-gray-700">{curso.descripcion}</p>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[13px]">
            <span className="font-semibold">
              {t('courses.progress', { superados: resumen.superados, total: resumen.total })}
            </span>
            <span className="text-muted-foreground">{resumen.porcentaje} %</span>
          </div>
          <ProgressBar value={resumen.porcentaje} label={t('courses.progressLabel')} />
        </div>

        {paso.tipo !== 'aprobado' && (
          <div className="rounded-[10px] bg-background px-3.5 py-3">
            <div className="text-xs text-muted-foreground">{t('courses.next')}</div>
            <div className="text-sm leading-snug font-semibold">
              {paso.tipo === 'capitulo'
                ? t('courses.nextChapter', { orden: paso.capitulo.orden, titulo: tituloCorto(paso.capitulo.titulo) })
                : t('courses.nextFinal')}
            </div>
          </div>
        )}

        <Button asChild size="touch">
          <Link to={`/cursos/${curso.id}`}>
            {empezado ? t('courses.continue') : t('courses.start')}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

/** Tarjeta compacta de un curso aprobado. */
export function ApprovedCourseCard({ curso, progreso }: CourseCardProps) {
  const { t } = useTranslation()
  const nota = mejorIntento(progreso, curso.testFinal.id)?.porcentaje ?? 0

  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 text-foreground"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
        <Check className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{curso.titulo}</span>
        <span className="block text-[13px] text-muted-foreground">{t('courses.approvedWith', { nota })}</span>
      </span>
    </Link>
  )
}

/** «Normativa aplicable: PRL, …» → «Normativa aplicable» para la línea de siguiente paso. */
function tituloCorto(titulo: string) {
  return titulo.split(':')[0]
}
