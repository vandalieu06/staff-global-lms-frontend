import type { ReactNode } from 'react'
import { ArrowLeft, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AppHeaderProps =
  | {
      variant: 'root'
      title: string
      actions?: ReactNode
      className?: string
    }
  | {
      variant: 'detail'
      /** Contexto corto junto al botón: «Curso», «Capítulo 2 de 5»… */
      title: string
      /** Destino del botón de volver o cerrar. */
      to: string
      icon?: 'back' | 'close'
      actions?: ReactNode
      className?: string
    }

/**
 * Cabecera de pantalla (DESIGN.md › Cabecera). Raíz: título de 24 px.
 * Detalle: botón de volver o cerrar de 44 px más el contexto.
 */
export function AppHeader(props: AppHeaderProps) {
  const { t } = useTranslation()

  if (props.variant === 'root') {
    return (
      <header className={cn('flex h-16 items-center gap-2 px-5', props.className)}>
        <h1 className="flex-1 text-2xl font-bold tracking-tight">{props.title}</h1>
        {props.actions}
      </header>
    )
  }

  const isClose = props.icon === 'close'
  const Icon = isClose ? X : ArrowLeft

  return (
    <header className={cn('flex h-14 items-center gap-1 px-2', props.className)}>
      <Button asChild variant="ghost" size="icon-touch">
        <Link to={props.to} aria-label={isClose ? t('common.close') : t('common.back')}>
          <Icon aria-hidden="true" />
        </Link>
      </Button>
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{props.title}</span>
      {props.actions}
    </header>
  )
}
