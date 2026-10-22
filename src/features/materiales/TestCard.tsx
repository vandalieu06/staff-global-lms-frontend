import { CircleCheck, ClipboardList, Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ProgressBar } from '@/components/ProgressBar'
import { Button } from '@/components/ui/button'
import {
  aciertosNecesarios,
  materialesPendientes,
  materialesVistos,
  mejorIntento,
  testDesbloqueado,
  testSuperado,
} from '@/lib/rules'
import type { Capitulo, ProgresoCurso } from '@/types/domain'

type TestCardProps = { capitulo: Capitulo; progreso: ProgresoCurso; to: string }

/**
 * Tarjeta del test del capítulo (mockup 3.1) con tres estados: bloqueado (faltan materiales),
 * disponible y superado. Repetir un test superado queda pendiente de decidir (decisiones.md §8).
 */
export function TestCard({ capitulo, progreso, to }: TestCardProps) {
  const { t } = useTranslation()
  const { test } = capitulo
  const superado = testSuperado(progreso, test.id)
  const disponible = testDesbloqueado(capitulo, progreso)
  const pendientes = materialesPendientes(capitulo, progreso)
  const vistos = materialesVistos(capitulo, progreso)
  const Icon = superado ? CircleCheck : disponible ? ClipboardList : Lock

  return (
    <section
      aria-labelledby="test-titulo"
      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={superado ? 'mt-0.5 size-[18px] text-green-700' : 'mt-0.5 size-[18px] text-muted-foreground'}
          aria-hidden="true"
        />
        <div className="flex-1">
          <h2 id="test-titulo" className="text-base font-bold">
            {t('chapter.test.title')}
          </h2>
          <p className="mt-1 text-sm leading-snug text-gray-700">
            {superado
              ? t('chapter.test.passed', { nota: mejorIntento(progreso, test.id)?.porcentaje ?? 0 })
              : t('chapter.test.conditions', {
                  preguntas: test.preguntas.length,
                  nota: test.notaMinima,
                  aciertos: aciertosNecesarios(test.preguntas.length, test.notaMinima),
                })}
          </p>
        </div>
      </div>

      {superado ? (
        <p className="text-sm text-muted-foreground">{t('chapter.test.passedBody')}</p>
      ) : (
        <>
          <ProgressBar
            className="h-1.5"
            value={capitulo.materiales.length ? (vistos / capitulo.materiales.length) * 100 : 0}
            label={t('chapter.test.progressLabel')}
          />
          {disponible ? (
            <Button asChild size="touch">
              <Link to={to}>{t('chapter.test.start')}</Link>
            </Button>
          ) : (
            <Button size="touch" disabled>
              {t('chapter.test.lockedButton', { count: pendientes })}
            </Button>
          )}
        </>
      )}
    </section>
  )
}
