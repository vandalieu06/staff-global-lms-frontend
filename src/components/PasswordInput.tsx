import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Clases de los campos de formulario a tamaño móvil (DESIGN.md › Input). */
export const inputMovil = 'h-12 rounded-[10px] bg-card px-3.5 text-base md:text-base'

/** Campo de contraseña con botón de 44 px para mostrarla u ocultarla. */
export function PasswordInput({ className, ...props }: ComponentProps<'input'>) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const Icon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(inputMovil, 'pr-12', className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-touch"
        className="absolute top-0.5 right-0.5 text-muted-foreground"
        aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon aria-hidden="true" />
      </Button>
    </div>
  )
}
