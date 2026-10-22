import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { getCursosAsignados, useUsuarioActual } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { SIN_PROGRESO, useProgresos } from '@/lib/progress-store'
import { cursoAprobado } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'
import { iniciales } from '@/lib/utils'
import { ApprovedCourseCard, CourseCard } from './CourseCard'

/** 2.1 Mis cursos (docs/pantallas.md §2.1). */
export function Component() {
  const { t } = useTranslation()
  const usuario = useUsuarioActual()
  const progresos = useProgresos()
  const cursos = useAsync(getCursosAsignados, [])

  const avatar = usuario && (
    <Link
      to="/perfil"
      aria-label={t('courses.profile')}
      className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800"
    >
      {iniciales(usuario.nombre, usuario.apellidos)}
    </Link>
  )

  return (
    <>
      <AppHeader variant="root" title={t('screens.courses')} actions={avatar} />
      {cursos.status === 'loading' && <LoadingState blocks={1} />}
      {cursos.status === 'error' && <ErrorState onRetry={cursos.reload} />}
      {cursos.status === 'success' && (
        <main className="flex flex-col gap-6 px-5 pt-1 pb-6">
          {cursos.data.length === 0 ? (
            <p className="text-[15px] leading-normal text-gray-700">{t('courses.empty')}</p>
          ) : (
            <Secciones cursos={cursos.data} progresos={progresos} />
          )}
        </main>
      )}
    </>
  )
}

function Secciones({
  cursos,
  progresos,
}: {
  cursos: Awaited<ReturnType<typeof getCursosAsignados>>
  progresos: ReturnType<typeof useProgresos>
}) {
  const { t } = useTranslation()
  const conProgreso = cursos.map((curso) => ({ curso, progreso: progresos[curso.id] ?? SIN_PROGRESO }))
  const enCurso = conProgreso.filter(({ curso, progreso }) => !cursoAprobado(curso, progreso))
  const aprobados = conProgreso.filter(({ curso, progreso }) => cursoAprobado(curso, progreso))

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-gray-700">
          {t('courses.inProgress', { count: enCurso.length })}
        </h2>
        {enCurso.map(({ curso, progreso }) => (
          <CourseCard key={curso.id} curso={curso} progreso={progreso} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-gray-700">
          {t('courses.approved', { count: aprobados.length })}
        </h2>
        {aprobados.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-gray-300 p-[18px] text-sm leading-normal text-muted-foreground">
            {t('courses.approvedEmpty')}
          </p>
        ) : (
          aprobados.map(({ curso, progreso }) => (
            <ApprovedCourseCard key={curso.id} curso={curso} progreso={progreso} />
          ))
        )}
      </section>
    </>
  )
}
