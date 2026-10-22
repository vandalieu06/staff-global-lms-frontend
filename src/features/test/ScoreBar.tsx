import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** Barra de nota con la marca vertical de la nota mínima (mockups 4.3 y 4.4). */
export function ScoreBar({ nota, minima }: { nota: number; minima: number }) {
  const { t } = useTranslation()
  const superado = nota >= minima
  return (
    <div
      role="img"
      aria-label={t('test.scoreLabel', { nota, minima })}
      className="relative h-2 rounded-full bg-muted"
    >
      <div
        className={cn('h-full rounded-full', superado ? 'bg-success' : 'bg-red-500')}
        style={{ width: `${Math.min(100, Math.max(0, nota))}%` }}
      />
      <span
        aria-hidden="true"
        className="absolute -top-1 h-4 w-0.5 -translate-x-1/2 bg-foreground"
        style={{ left: `${minima}%` }}
      />
    </div>
  )
}
