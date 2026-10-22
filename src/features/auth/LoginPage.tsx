import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router'
import { z } from 'zod'
import { CredencialesInvalidas, login, useUsuarioActual } from '@/api'
import { LanguageSelect } from '@/components/LanguageSelect'
import { inputMovil, PasswordInput } from '@/components/PasswordInput'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

/** 1.1 Login (docs/pantallas.md §1.1). */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usuario = useUsuarioActual()
  const [errorCredenciales, setErrorCredenciales] = useState(false)

  const schema = z.object({
    email: z.string().trim().min(1, t('auth.login.emailRequired')).email(t('auth.login.emailInvalid')),
    password: z.string().min(1, t('auth.login.passwordRequired')),
  })
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })
  const { errors, isSubmitting } = form.formState

  if (usuario && !isSubmitting) return <Navigate to="/" replace />

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setErrorCredenciales(false)
    try {
      const u = await login(email, password)
      navigate(u.mustChangePassword ? '/primer-acceso' : '/', { replace: true })
    } catch (error) {
      if (error instanceof CredencialesInvalidas) setErrorCredenciales(true)
      else throw error
    }
  })

  const contacto = `mailto:?subject=${encodeURIComponent(t('auth.login.contactSubject'))}`

  return (
    <div className="flex min-h-dvh flex-col bg-card">
      <div className="flex h-[280px] flex-col bg-brand-gradient px-5 pt-4 pb-7 text-white">
        <div className="flex justify-end">
          <LanguageSelect variant="brand" />
        </div>
        <div className="mt-auto flex flex-col gap-2.5">
          <p className="text-[15px] font-bold">{t('app.name')}</p>
          <p className="text-[28px] leading-[1.15] font-bold tracking-tight">{t('auth.login.tagline')}</p>
        </div>
      </div>

      <main className="flex flex-col gap-[18px] px-5 pt-7 pb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">{t('auth.login.title')}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('auth.login.email')}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              aria-invalid={!!errors.email}
              className={inputMovil}
              {...form.register('email')}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('auth.login.password')}
            </FieldLabel>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...form.register('password')}
            />
            <FieldError errors={[errors.password]} />
          </Field>

          {errorCredenciales && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle aria-hidden="true" />
              <AlertDescription className="text-sm text-red-900">{t('auth.login.invalid')}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" size="touch" className="mt-1.5" disabled={isSubmitting}>
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>
        </form>

        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          {t('auth.login.help')}{' '}
          <a href={contacto} className="font-semibold text-primary">
            {t('auth.login.contact')}
          </a>
        </p>
      </main>
    </div>
  )
}
