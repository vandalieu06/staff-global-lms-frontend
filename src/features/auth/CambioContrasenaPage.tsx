import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Circle } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMatch, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { cambiarContrasena, ContrasenaActualIncorrecta, useUsuarioActual } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { PasswordInput } from '@/components/PasswordInput'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { cumpleRequisitos, passwordSchema, requisitos } from './password-schema'

/**
 * 1.2 Nueva contraseña (docs/pantallas.md §1.2). En `/primer-acceso` sustituye la provisional;
 * en `/perfil/contrasena` pide además la actual.
 */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useUsuarioActual()
  const desdePerfil = useMatch('/perfil/contrasena') !== null

  const form = useForm({
    resolver: zodResolver(passwordSchema(desdePerfil, t('auth.password.currentRequired'))),
    defaultValues: { actual: '', nueva: '', repetida: '' },
  })
  const { errors, isSubmitting } = form.formState
  const [nueva, repetida] = useWatch({ control: form.control, name: ['nueva', 'repetida'] })
  const valido = cumpleRequisitos(nueva, repetida)

  const onSubmit = form.handleSubmit(async ({ actual, nueva }) => {
    try {
      await cambiarContrasena(nueva, actual)
      if (desdePerfil) {
        toast.success(t('auth.password.saved'))
        navigate('/perfil', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (error) {
      if (!(error instanceof ContrasenaActualIncorrecta)) throw error
      form.setError('actual', { message: t('auth.password.currentWrong') }, { shouldFocus: true })
    }
  })

  return (
    <div className="min-h-dvh bg-card">
      {desdePerfil ? (
        <AppHeader variant="detail" title={t('profile.changePassword')} to="/perfil" />
      ) : (
        <header className="flex h-14 items-center justify-between border-b border-gray-100 px-5">
          <span className="text-[15px] font-bold text-primary">{t('app.name')}</span>
          <span className="text-[13px] text-muted-foreground">{t('auth.password.step')}</span>
        </header>
      )}

      <main className="flex flex-col gap-5 px-5 pt-7 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {desdePerfil ? t('auth.password.changeTitle') : t('auth.password.firstTitle')}
          </h1>
          <p className="mt-2 text-[15px] leading-normal text-gray-700">
            {desdePerfil
              ? t('auth.password.changeBody')
              : t('auth.password.firstBody', { nombre: usuario?.nombre ?? '' })}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          {desdePerfil && (
            <Field data-invalid={!!errors.actual}>
              <FieldLabel htmlFor="actual" className="text-sm font-medium text-gray-700">
                {t('auth.password.current')}
              </FieldLabel>
              <PasswordInput
                id="actual"
                autoComplete="current-password"
                aria-invalid={!!errors.actual}
                {...form.register('actual')}
              />
              <FieldError errors={[errors.actual]} />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="nueva" className="text-sm font-medium text-gray-700">
              {t('auth.password.new')}
            </FieldLabel>
            <PasswordInput
              id="nueva"
              autoComplete="new-password"
              aria-describedby="requisitos"
              {...form.register('nueva')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="repetida" className="text-sm font-medium text-gray-700">
              {t('auth.password.repeat')}
            </FieldLabel>
            <PasswordInput
              id="repetida"
              autoComplete="new-password"
              aria-describedby="requisitos"
              {...form.register('repetida')}
            />
          </Field>

          <ul
            id="requisitos"
            aria-label={t('auth.password.requirements')}
            aria-live="polite"
            className="flex flex-col gap-2.5 rounded-xl bg-background px-4 py-3.5"
          >
            {requisitos.map((r) => {
              const ok = r.cumple(nueva, repetida)
              const Icon = ok ? Check : Circle
              return (
                <li key={r.id} className="flex items-center gap-2 text-sm" data-cumple={ok}>
                  <Icon
                    className={cn('size-4', ok ? 'text-green-700' : 'text-muted-foreground')}
                    aria-hidden="true"
                  />
                  <span className={ok ? 'text-gray-700' : 'text-muted-foreground'}>
                    {t(r.labelKey)}
                    <span className="sr-only">
                      {' · '}
                      {ok ? t('auth.password.reqMet') : t('auth.password.reqPending')}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>

          <Button type="submit" size="touch" className="mt-1" disabled={!valido || isSubmitting}>
            {isSubmitting
              ? t('auth.password.saving')
              : desdePerfil
                ? t('auth.password.submitChange')
                : t('auth.password.submitFirst')}
          </Button>
        </form>
      </main>
    </div>
  )
}
