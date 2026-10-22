import { BookOpen, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', labelKey: 'nav.courses', Icon: BookOpen, end: true },
  { to: '/perfil', labelKey: 'nav.profile', Icon: User, end: false },
] as const

/** Barra inferior con los dos destinos raíz (DESIGN.md › Barra inferior). */
export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('nav.label')}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto grid max-w-[480px] grid-cols-2 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]"
    >
      {items.map(({ to, labelKey, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex h-[72px] flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground',
              isActive && 'font-semibold text-primary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-[30px] w-14 items-center justify-center rounded-full',
                  isActive && 'bg-brand-50',
                )}
              >
                <Icon className="size-[22px]" aria-hidden="true" />
              </span>
              {t(labelKey)}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
