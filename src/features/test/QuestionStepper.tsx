import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** Progreso segmentado del test: un segmento por pregunta (DESIGN.md › Progreso del test). */
export function QuestionStepper({ actual, total }: { actual: number; total: number }) {
  const { t } = useTranslation()
  return (
    <div
      role="progressbar"
      aria-label={t('test.progressLabel')}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={actual}
      aria-valuetext={t('test.question', { n: actual, total })}
      className="flex gap-1.5 px-3"
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < actual ? 'bg-primary' : 'bg-gray-200')} />
      ))}
    </div>
  )
}
