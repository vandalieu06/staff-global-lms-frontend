import { cn } from '@/lib/utils'

type ProgressBarProps = {
  /** 0–100. */
  value: number
  label: string
  className?: string
  /** Clase del relleno (por defecto, morado de marca). */
  barClassName?: string
}

/** Barra de progreso de DESIGN.md: 8 px, pista `gray-100`, relleno `primary`. */
export function ProgressBar({ value, label, className, barClassName }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 overflow-hidden rounded-full bg-muted', className)}
    >
      <div className={cn('h-full rounded-full bg-primary transition-[width]', barClassName)} style={{ width: `${v}%` }} />
    </div>
  )
}
