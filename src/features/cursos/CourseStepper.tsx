import { Check, GraduationCap, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  estadosCapitulos,
  estadoTestFinal,
  materialesVistos,
  mejorIntento,
  testDesbloqueado,
} from '@/lib/rules'
import { cn } from '@/lib/utils'
import type { Capitulo, Curso, EstadoCapitulo, ProgresoCurso } from '@/types/domain'

type CourseStepperProps = { curso: Curso; progreso: ProgresoCurso }

/**
 * Temario como pasos (mockup 2.2): superado (verde), en curso (morado, resaltado) y bloqueado
 * (gris, no pulsable). El último paso es el test final del curso.
 */
export function CourseStepper({ curso, progreso }: CourseStepperProps) {
  const { t } = useTranslation()
  const estados = estadosCapitulos(curso, progreso)
  const final = estadoTestFinal(curso, progreso)
  const notaFinal = mejorIntento(progreso, curso.testFinal.id)?.porcentaje

  return (
    <ol className="flex flex-col" aria-label={t('course.syllabus')}>
      {curso.capitulos.map((capitulo, i) => {
        const estado = estados.get(capitulo.id)!
        const anterior = curso.capitulos[i - 1]
        return (
          <Paso
            key={capitulo.id}
            estado={estado}
            marca={estado === 'en-curso' ? String(capitulo.orden) : undefined}
            to={estado === 'bloqueado' ? undefined : `/cursos/${curso.id}/capitulos/${capitulo.id}`}
            titulo={t('course.chapterTitle', { orden: capitulo.orden, titulo: capitulo.titulo })}
            linea
          >
            <DetalleCapitulo capitulo={capitulo} estado={estado} progreso={progreso} anterior={anterior} />
          </Paso>
        )
      })}

      <Paso
        estado={final === 'disponible' ? 'en-curso' : final === 'superado' ? 'superado' : 'bloqueado'}
        icono={final === 'bloqueado' ? <GraduationCap aria-hidden="true" /> : undefined}
        to={
          final === 'disponible'
            ? `/cursos/${curso.id}/test-final`
            : final === 'superado'
              ? `/cursos/${curso.id}/aprobado`
              : undefined
        }
        titulo={t('course.finalTest')}
      >
        {final === 'bloqueado' && (
          <span className="text-[13px] text-muted-foreground">
            {t('course.finalMeta', {
              preguntas: curso.testFinal.preguntas.length,
              capitulos: curso.capitulos.length,
            })}
          </span>
        )}
        {final === 'disponible' && (
          <Etiqueta tono="marca">
            {t('course.finalReady', {
              preguntas: curso.testFinal.preguntas.length,
              nota: curso.testFinal.notaMinima,
            })}
          </Etiqueta>
        )}
        {final === 'superado' && <Etiqueta tono="exito">{t('course.finalPassed', { nota: notaFinal })}</Etiqueta>}
      </Paso>
    </ol>
  )
}

function DetalleCapitulo({
  capitulo,
  estado,
  progreso,
  anterior,
}: {
  capitulo: Capitulo
  estado: EstadoCapitulo
  progreso: ProgresoCurso
  anterior?: Capitulo
}) {
  const { t } = useTranslation()

  if (estado === 'bloqueado') {
    return (
      <span className="text-[13px] text-muted-foreground">
        {t('course.lockedBy', { orden: anterior?.orden ?? capitulo.orden - 1 })}
      </span>
    )
  }
  if (capitulo.contenidoPendiente) {
    return <Etiqueta tono="neutro">{t('course.pending')}</Etiqueta>
  }

  const meta = (
    <span className="text-[13px] leading-snug text-muted-foreground">
      {t('course.meta', {
        materiales: capitulo.materiales.length,
        preguntas: capitulo.test.preguntas.length,
        nota: capitulo.test.notaMinima,
      })}
    </span>
  )

  if (estado === 'superado') {
    const nota = mejorIntento(progreso, capitulo.test.id)?.porcentaje ?? 0
    return (
      <>
        {meta}
        <Etiqueta tono="exito">{t('course.passed', { nota })}</Etiqueta>
      </>
    )
  }

  return (
    <>
      {meta}
      <Etiqueta tono="marca">
        {testDesbloqueado(capitulo, progreso)
          ? t('course.testReady')
          : t('course.inProgressMaterials', {
              vistos: materialesVistos(capitulo, progreso),
              total: capitulo.materiales.length,
            })}
      </Etiqueta>
    </>
  )
}

function Paso({
  estado,
  marca,
  icono,
  to,
  titulo,
  linea = false,
  children,
}: {
  estado: EstadoCapitulo
  marca?: string
  icono?: ReactNode
  to?: string
  titulo: string
  linea?: boolean
  children: ReactNode
}) {
  const { t } = useTranslation()
  const enCurso = estado === 'en-curso'

  const punto = (
    <span
      className={cn(
        'relative z-10 flex size-9 items-center justify-center rounded-full text-sm font-bold [&_svg]:size-4',
        estado === 'superado' && 'bg-green-700 text-white',
        enCurso && 'bg-primary text-primary-foreground',
        estado === 'bloqueado' && 'bg-muted text-muted-foreground',
      )}
    >
      {estado === 'superado' ? (
        <Check aria-hidden="true" />
      ) : (
        (icono ?? marca ?? <Lock aria-hidden="true" />)
      )}
      {estado !== 'en-curso' && (
        <span className="sr-only">
          {estado === 'superado' ? t('course.statusPassed') : t('course.statusLocked')}
        </span>
      )}
    </span>
  )

  const contenido = (
    <>
      {linea && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-9 bottom-[-4px] w-0.5',
            enCurso ? 'left-[29px] top-12 bg-border' : 'left-[17px]',
            estado === 'superado' ? 'bg-primary' : 'bg-border',
          )}
        />
      )}
      {punto}
      <div className={cn('flex min-w-0 flex-col gap-1 pt-1.5', enCurso ? 'pb-3.5' : 'pb-[22px]')}>
        <span
          className={cn('text-[15px] leading-snug font-semibold', estado === 'bloqueado' && 'text-gray-700')}
        >
          {titulo}
        </span>
        {children}
      </div>
    </>
  )

  const clases = cn(
    'relative grid grid-cols-[36px_1fr] gap-x-3.5 text-foreground',
    enCurso && '-mx-3 mb-3 rounded-xl border border-brand-200 bg-card px-3 pt-3',
  )

  return (
    <li aria-current={enCurso ? 'step' : undefined}>
      {to ? (
        <Link to={to} className={clases}>
          {contenido}
        </Link>
      ) : (
        <div className={clases}>{contenido}</div>
      )}
    </li>
  )
}

function Etiqueta({ tono, children }: { tono: 'exito' | 'marca' | 'neutro'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'mt-1 inline-flex h-[22px] items-center self-start rounded-full px-2 text-xs font-semibold',
        tono === 'exito' && 'bg-green-100 text-green-900',
        tono === 'marca' && 'bg-brand-50 text-brand-800',
        tono === 'neutro' && 'bg-muted text-gray-700',
      )}
    >
      {children}
    </span>
  )
}
