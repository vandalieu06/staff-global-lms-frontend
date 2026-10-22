import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { StickyFooter } from '@/components/StickyFooter'
import { Button } from '@/components/ui/button'
import { crearIntento } from '@/lib/attempt-store'
import { useProgreso } from '@/lib/progress-store'
import { aciertosNecesarios, intentosDe, mejorIntento, testSuperado } from '@/lib/rules'
import { cn } from '@/lib/utils'
import { useDatosTest } from './useTestScope'

/** 4.1 Test · inicio (docs/pantallas.md §4.1), para un capítulo o para el test final. */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cursoId, isFinal, base, exitTo, datos, bloqueado, curso, capitulo, test, contexto } = useDatosTest()
  const progreso = useProgreso(cursoId)

  if (!curso || !test) {
    return (
      <>
        <AppHeader variant="detail" title={contexto || t('screens.testStart')} to={exitTo} />
        {datos.status === 'loading' || bloqueado ? <LoadingState /> : <ErrorState onRetry={datos.reload} />}
      </>
    )
  }

  const intentos = intentosDe(progreso, test.id)
  const ultimo = intentos.at(-1)
  const superado = testSuperado(progreso, test.id)
  const necesarios = aciertosNecesarios(test.preguntas.length, test.notaMinima)

  const empezar = () => {
    crearIntento(cursoId, test.id, test.preguntas.length)
    navigate(`${base}/intento`)
  }

  return (
    <div className="pb-28">
      <AppHeader variant="detail" title={contexto} to={exitTo} />
      <main className="flex flex-col gap-[22px] px-5 pt-2">
        <section className="flex flex-col gap-2">
          <h1 className="text-[28px] font-bold tracking-tight">
            {isFinal ? t('test.titleFinal') : t('test.titleChapter')}
          </h1>
          <p className="text-[15px] leading-normal text-gray-700">{isFinal ? curso.titulo : capitulo?.titulo}</p>
        </section>

        <dl className="grid grid-cols-2 rounded-xl border border-border bg-card">
          <Dato etiqueta={t('test.questions')} valor={String(test.preguntas.length)} />
          <Dato
            etiqueta={t('test.toPass')}
            valor={t('test.toPassValue', { nota: test.notaMinima })}
            extra={t('test.toPassHits', { count: necesarios })}
            borde="l"
          />
          <Dato etiqueta={t('test.attempts')} valor={t('test.unlimited')} borde="t" />
          <Dato etiqueta={t('test.time')} valor={t('test.noLimit')} borde="tl" />
        </dl>

        <section className="flex flex-col gap-3.5">
          <h2 className="text-[17px] font-bold">{t('test.before')}</h2>
          <ul className="flex flex-col gap-3.5">
            {(['test.rule1', 'test.rule2', 'test.rule3'] as const).map((regla) => (
              <li key={regla} className="flex items-start gap-3 text-[15px] leading-normal text-gray-700">
                <Check className="mt-0.5 size-[18px] shrink-0 text-primary" aria-hidden="true" />
                {t(regla)}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-sm text-muted-foreground">
          {superado
            ? t('test.alreadyPassed', { nota: mejorIntento(progreso, test.id)?.porcentaje ?? 0 })
            : ultimo
              ? t('test.lastAttempt', {
                  count: intentos.length,
                  nota: ultimo.porcentaje,
                  aciertos: ultimo.aciertos,
                  total: ultimo.total,
                })
              : t('test.firstAttempt')}
        </p>
      </main>

      <StickyFooter>
        {superado ? (
          <Button asChild size="touch" variant="outline">
            <Link to={isFinal ? `/cursos/${cursoId}/aprobado` : exitTo}>
              {isFinal ? t('test.seeApproval') : t('test.backToChapter')}
            </Link>
          </Button>
        ) : (
          <Button size="touch" onClick={empezar}>
            {t('test.start')}
          </Button>
        )}
      </StickyFooter>
    </div>
  )
}

function Dato({
  etiqueta,
  valor,
  extra,
  borde,
}: {
  etiqueta: string
  valor: string
  extra?: string
  borde?: 'l' | 't' | 'tl'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 px-4 py-3.5',
        borde?.includes('l') && 'border-l border-gray-100',
        borde?.includes('t') && 'border-t border-gray-100',
      )}
    >
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="text-xl font-semibold">
        {valor} {extra && <span className="text-sm font-medium text-muted-foreground">{extra}</span>}
      </dd>
    </div>
  )
}

