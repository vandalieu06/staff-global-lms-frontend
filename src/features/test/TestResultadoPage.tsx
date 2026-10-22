import { Check, ChevronRight, GraduationCap, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { ProgressBar } from '@/components/ProgressBar'
import { StickyFooter } from '@/components/StickyFooter'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useProgreso } from '@/lib/progress-store'
import { corregir, intentosDe, progresoCurso, type DetallePregunta } from '@/lib/rules'
import type { Curso, Pregunta } from '@/types/domain'
import { FalladaCard } from './FalladaCard'
import { ScoreBar } from './ScoreBar'
import { useDatosTest } from './useTestScope'

/**
 * 4.3 / 4.4 Resultado del test (docs/pantallas.md §4.3–4.4). Muestra el último intento enviado:
 * no superado (con las falladas y su explicación) o superado (con el siguiente paso).
 */
export function Component() {
  const { t } = useTranslation()
  const { cursoId, isFinal, base, exitTo, datos, bloqueado, curso, capitulo, test, contexto } = useDatosTest()
  const progreso = useProgreso(cursoId)

  if (!curso || !test) {
    return (
      <>
        <AppHeader variant="detail" title={t('screens.testResult')} to={exitTo} icon="close" />
        {datos.status === 'loading' || bloqueado ? <LoadingState /> : <ErrorState onRetry={datos.reload} />}
      </>
    )
  }

  const intentos = intentosDe(progreso, test.id)
  const ultimo = intentos.at(-1)
  if (!ultimo) return <Navigate to={base} replace />
  // El test final superado se celebra en su propia pantalla.
  if (isFinal && ultimo.superado) return <Navigate to={`/cursos/${cursoId}/aprobado`} replace />

  const correccion = corregir(test, ultimo.respuestas)
  const numero = (p: Pregunta) => test.preguntas.indexOf(p) + 1
  const salida = isFinal ? `/cursos/${cursoId}` : exitTo

  return (
    <div className="pb-36">
      <AppHeader
        variant="detail"
        title={t('test.resultTitle', { contexto })}
        to={ultimo.superado ? `/cursos/${cursoId}` : salida}
        icon="close"
      />
      <main className="flex flex-col gap-6 px-5 pt-2">
        <section className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-5">
          {ultimo.superado ? (
            <span className="inline-flex h-6 items-center gap-1.5 self-start rounded-full bg-green-100 px-2.5 text-[13px] font-semibold text-green-900">
              <Check className="size-3.5" aria-hidden="true" />
              {isFinal ? t('test.passedFinal') : t('test.passedChapter')}
            </span>
          ) : (
            <span className="inline-flex h-6 items-center self-start rounded-full bg-red-100 px-2.5 text-[13px] font-semibold text-red-800">
              {t('test.failed')}
            </span>
          )}
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[40px] font-bold tracking-tight">{correccion.porcentaje} %</h1>
            <span className="text-[15px] text-gray-700">
              {t('test.correctCount', { aciertos: correccion.aciertos, total: correccion.total })}
            </span>
          </div>
          <ScoreBar nota={correccion.porcentaje} minima={test.notaMinima} />
          <p className="text-sm leading-normal text-gray-700">
            {ultimo.superado
              ? t('test.passedBody', { nota: test.notaMinima, intento: intentos.length })
              : t('test.failedBody', { nota: test.notaMinima, aciertos: correccion.necesarios })}
          </p>
        </section>

        {ultimo.superado && !isFinal && capitulo && <SiguientePaso curso={curso} ordenActual={capitulo.orden} />}

        {ultimo.superado ? (
          correccion.falladas.length > 0 && (
            <Plegable titulo={t('test.wrongTitle', { count: correccion.falladas.length })}>
              {correccion.falladas.map((d) => (
                <FalladaCard key={d.pregunta.id} detalle={d} numero={numero(d.pregunta)} />
              ))}
            </Plegable>
          )
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold">{t('test.wrongTitle', { count: correccion.falladas.length })}</h2>
            {correccion.falladas.map((d) => (
              <FalladaCard key={d.pregunta.id} detalle={d} numero={numero(d.pregunta)} />
            ))}
            {correccion.acertadas.length > 0 && (
              <Plegable titulo={t('test.rightTitle', { count: correccion.acertadas.length })}>
                {correccion.acertadas.map((d) => (
                  <Acertada key={d.pregunta.id} detalle={d} numero={numero(d.pregunta)} />
                ))}
              </Plegable>
            )}
          </section>
        )}

        {ultimo.superado && <ProgresoDelCurso curso={curso} />}
      </main>

      <StickyFooter className={ultimo.superado ? undefined : 'grid grid-cols-2'}>
        {ultimo.superado ? (
          <SiguienteAccion curso={curso} ordenActual={capitulo?.orden ?? 0} />
        ) : (
          <>
            <Button asChild size="touch" variant="outline">
              <Link to={salida}>{t('test.review')}</Link>
            </Button>
            <Button asChild size="touch">
              <Link to={base} replace>
                <RotateCcw aria-hidden="true" />
                {t('test.retry')}
              </Link>
            </Button>
          </>
        )}
      </StickyFooter>
    </div>
  )
}

function Plegable({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Accordion type="single" collapsible className="rounded-xl border border-border bg-card">
      <AccordionItem value="contenido">
        <AccordionTrigger className="min-h-[52px] items-center px-4 text-[15px] font-semibold hover:no-underline">
          {titulo}
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-3 px-3 pb-3">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function Acertada({ detalle, numero }: { detalle: DetallePregunta; numero: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-background p-3">
      <span className="text-xs text-muted-foreground">{t('test.questionN', { n: numero })}</span>
      <p className="text-sm font-semibold">{detalle.pregunta.enunciado}</p>
      <p className="flex items-start gap-2 text-sm text-green-900">
        <Check className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
        {detalle.pregunta.respuestas[detalle.pregunta.correcta]}
      </p>
    </div>
  )
}

/** Tarjeta «Siguiente capítulo desbloqueado» (o el test final si era el último capítulo). */
function SiguientePaso({ curso, ordenActual }: { curso: Curso; ordenActual: number }) {
  const { t } = useTranslation()
  const siguiente = curso.capitulos.find((c) => c.orden === ordenActual + 1)
  const to = siguiente ? `/cursos/${curso.id}/capitulos/${siguiente.id}` : `/cursos/${curso.id}/test-final`

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-[17px] font-bold">{siguiente ? t('test.nextUnlocked') : t('test.finalUnlocked')}</h2>
      <Link
        to={to}
        className="flex items-center gap-3.5 rounded-xl border border-brand-200 bg-card px-4 py-3.5 text-foreground"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {siguiente ? siguiente.orden : <GraduationCap className="size-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug font-semibold">
            {siguiente ? siguiente.titulo : t('test.titleFinal')}
          </span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            {siguiente
              ? t('test.chapterOf', { orden: siguiente.orden, total: curso.capitulos.length })
              : t('test.questions') + ` · ${curso.testFinal.preguntas.length}`}
          </span>
        </span>
        <ChevronRight className="size-[18px] text-muted-foreground" aria-hidden="true" />
      </Link>
    </section>
  )
}

function SiguienteAccion({ curso, ordenActual }: { curso: Curso; ordenActual: number }) {
  const { t } = useTranslation()
  const siguiente = curso.capitulos.find((c) => c.orden === ordenActual + 1)
  return (
    <>
      <Button asChild size="touch">
        <Link to={siguiente ? `/cursos/${curso.id}/capitulos/${siguiente.id}` : `/cursos/${curso.id}/test-final`}>
          {siguiente ? t('test.startChapter', { orden: siguiente.orden }) : t('test.goToFinal')}
        </Link>
      </Button>
      <Button asChild variant="link" className="h-11 text-[15px] font-semibold">
        <Link to={`/cursos/${curso.id}`}>{t('test.backToSyllabus')}</Link>
      </Button>
    </>
  )
}

function ProgresoDelCurso({ curso }: { curso: Curso }) {
  const { t } = useTranslation()
  const resumen = progresoCurso(curso, useProgreso(curso.id))
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-3 text-[13px]">
        <span className="font-semibold">
          {t('test.courseProgress', { curso: curso.titulo, superados: resumen.superados, total: resumen.total })}
        </span>
        <span className="text-muted-foreground">{resumen.porcentaje} %</span>
      </div>
      <ProgressBar value={resumen.porcentaje} label={t('courses.progressLabel')} className="bg-gray-200" />
    </div>
  )
}
