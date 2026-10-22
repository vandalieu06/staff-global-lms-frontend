import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/AppHeader'

type ScreenPlaceholderProps = {
  title: string
  /** Sin `backTo` se usa la cabecera raíz; con `backTo`, la de detalle. */
  backTo?: string
  icon?: 'back' | 'close'
}

/** Pantalla provisional de la spec 01: cabecera y título. La sustituyen las specs 03–05. */
export function ScreenPlaceholder({ title, backTo, icon }: ScreenPlaceholderProps) {
  const { t } = useTranslation()

  return (
    <>
      {backTo ? (
        <AppHeader variant="detail" title={title} to={backTo} icon={icon} />
      ) : (
        <AppHeader variant="root" title={title} />
      )}
      <main className="px-5 pt-1">
        {backTo && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
        <p className="mt-2 text-sm text-muted-foreground">{t('common.comingSoon')}</p>
      </main>
    </>
  )
}
