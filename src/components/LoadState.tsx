import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** Esqueleto genérico mientras carga una pantalla. */
export function LoadingState({ blocks = 2 }: { blocks?: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4 px-5 pt-2" aria-busy="true" aria-label={t('common.loading')}>
      <Skeleton className="h-7 w-2/3" />
      {Array.from({ length: blocks }, (_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-[14px]" />
      ))}
    </div>
  )
}

/** Error de carga con mensaje y, si se puede reintentar, botón. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="flex flex-col gap-4 px-5 pt-2">
      <p className="text-[15px] text-foreground">{message ?? t('common.error')}</p>
      {onRetry && (
        <Button variant="outline" size="touch" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
