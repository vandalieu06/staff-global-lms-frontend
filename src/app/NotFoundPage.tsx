import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-dvh flex-col justify-center gap-3 px-5">
      <h1 className="text-2xl font-bold tracking-tight">{t('notFound.title')}</h1>
      <p className="text-[15px] text-muted-foreground">{t('notFound.body')}</p>
      <Button asChild size="touch" className="mt-4">
        <Link to="/">{t('notFound.action')}</Link>
      </Button>
    </main>
  )
}
