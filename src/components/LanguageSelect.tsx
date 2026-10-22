import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

/** Idiomas con traducción disponible. En 0.1.0 solo español (docs/decisiones.md §1). */
const idiomas = [{ code: 'es', labelKey: 'language.es', short: 'ES' }] as const

type LanguageSelectProps = {
  /** `brand`: píldora blanca sobre la cabecera del login. `row`: fila de ajustes en Perfil. */
  variant: 'brand' | 'row'
}

export function LanguageSelect({ variant }: LanguageSelectProps) {
  const { t, i18n } = useTranslation()
  const actual = idiomas.find((i) => i.code === i18n.language) ?? idiomas[0]

  return (
    <Select value={actual.code} onValueChange={(code) => void i18n.changeLanguage(code)}>
      <SelectTrigger
        aria-label={t('language.label')}
        className={cn(
          variant === 'brand' &&
            'h-10! gap-1.5 rounded-full border-0 bg-white/16 px-3 text-sm font-semibold text-white [&_svg]:text-white!',
          variant === 'row' &&
            'h-[52px]! w-full rounded-none border-0 px-3.5 text-[15px] shadow-none focus-visible:ring-inset',
        )}
      >
        {variant === 'brand' ? (
          <>
            <Globe className="size-5" aria-hidden="true" />
            <span>{actual.short}</span>
          </>
        ) : (
          <>
            <Globe className="size-[18px] text-muted-foreground" aria-hidden="true" />
            <span className="flex-1 text-left">{t('language.label')}</span>
            <span className="text-sm text-muted-foreground">
              <SelectValue />
            </span>
          </>
        )}
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {idiomas.map((idioma) => (
          <SelectItem key={idioma.code} value={idioma.code} className="min-h-11 text-[15px]">
            {t(idioma.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
