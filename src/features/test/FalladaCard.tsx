import { CircleCheck, CircleX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DetallePregunta } from '@/lib/rules'

/**
 * Pregunta fallada (mockup 4.3): enunciado, la respuesta del alumno (rojo), la correcta (verde) y
 * la explicación. El estado se dice también con texto, no solo con color.
 */
export function FalladaCard({ detalle, numero }: { detalle: DetallePregunta; numero: number }) {
  const { t } = useTranslation()
  const { pregunta, elegida } = detalle

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <span className="text-[13px] font-medium text-muted-foreground">{t('test.questionN', { n: numero })}</span>
      <p className="text-[15px] leading-normal font-semibold">{pregunta.enunciado}</p>
      <div className="flex items-start gap-2.5 rounded-[10px] bg-red-50 px-3 py-2.5 text-sm leading-normal text-red-900">
        <CircleX className="mt-0.5 size-[18px] shrink-0 text-red-600" aria-hidden="true" />
        <span>
          <b className="block text-xs font-semibold">{t('test.yourAnswer')}</b>
          {pregunta.respuestas[elegida]}
        </span>
      </div>
      <div className="flex items-start gap-2.5 rounded-[10px] bg-green-50 px-3 py-2.5 text-sm leading-normal text-green-900">
        <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-green-600" aria-hidden="true" />
        <span>
          <b className="block text-xs font-semibold">{t('test.correctAnswer')}</b>
          {pregunta.respuestas[pregunta.correcta]}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{pregunta.explicacion}</p>
    </article>
  )
}
