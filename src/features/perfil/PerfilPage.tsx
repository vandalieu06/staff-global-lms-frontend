import { ChevronRight, Lock, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { getCursosAsignados, logout, useUsuarioActual } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { LanguageSelect } from '@/components/LanguageSelect'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { SIN_PROGRESO, useProgresos } from '@/lib/progress-store'
import { cursoAprobado } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'
import { iniciales } from '@/lib/utils'
import { DemoPanel, demoActiva } from './DemoPanel'

/** 2.3 Perfil (docs/pantallas.md §2.3). */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useUsuarioActual()
  const progresos = useProgresos()
  const cursos = useAsync(getCursosAsignados, [])

  if (!usuario) return null

  const asignados = cursos.data?.length
  const aprobados = cursos.data?.filter((c) => cursoAprobado(c, progresos[c.id] ?? SIN_PROGRESO)).length

  return (
    <>
      <AppHeader variant="root" title={t('screens.profile')} />
      <main className="flex flex-col gap-5 px-5 pt-1 pb-6">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800"
          >
            {iniciales(usuario.nombre, usuario.apellidos)}
          </span>
          <div className="min-w-0">
            <div className="text-lg font-bold">
              {usuario.nombre} {usuario.apellidos}
            </div>
            <div className="truncate text-sm text-muted-foreground">{usuario.email}</div>
          </div>
        </div>

        <dl className="grid grid-cols-2 rounded-xl border border-border bg-card">
          <div className="flex flex-col gap-0.5 px-4 py-3.5">
            <dt className="text-xs text-muted-foreground">{t('profile.assigned')}</dt>
            <dd className="text-[26px] font-semibold">{asignados ?? '—'}</dd>
          </div>
          <div className="flex flex-col gap-0.5 border-l border-gray-100 px-4 py-3.5">
            <dt className="text-xs text-muted-foreground">{t('profile.approvedCount')}</dt>
            <dd className="text-[26px] font-semibold">{aprobados ?? '—'}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="ml-1 text-sm font-semibold text-gray-700">{t('profile.data')}</h2>
          <dl className="flex flex-col divide-y divide-gray-100 rounded-xl border border-border bg-card">
            <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
              <dt className="text-xs text-muted-foreground">{t('profile.fullName')}</dt>
              <dd className="text-[15px] font-medium">
                {usuario.nombre} {usuario.apellidos}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
              <dt className="text-xs text-muted-foreground">{t('profile.email')}</dt>
              <dd className="text-[15px] font-medium break-all">{usuario.email}</dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="ml-1 text-sm font-semibold text-gray-700">{t('profile.settings')}</h2>
          <div className="flex flex-col divide-y divide-gray-100 overflow-hidden rounded-xl border border-border bg-card">
            <Link to="/perfil/contrasena" className="flex h-[52px] items-center gap-3 px-3.5 text-[15px] text-foreground">
              <Lock className="size-[18px] text-muted-foreground" aria-hidden="true" />
              <span className="flex-1">{t('profile.changePassword')}</span>
              <ChevronRight className="size-[18px] text-muted-foreground" aria-hidden="true" />
            </Link>
            <LanguageSelect variant="row" />
          </div>
        </section>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="touch"
              className="border-red-200 bg-card text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <LogOut aria-hidden="true" />
              {t('profile.logout')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('profile.logoutTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('profile.logoutBody')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-11">{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="h-11"
                onClick={async () => {
                  await logout()
                  navigate('/login', { replace: true })
                }}
              >
                {t('profile.logoutConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {demoActiva && <DemoPanel />}
      </main>
    </>
  )
}
