import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 1.2 Nueva contraseña: primer acceso o cambio desde Perfil. Se implementa en la spec 03. */
export function Component() {
  const { t } = useTranslation()
  const fromProfile = useMatch('/perfil/contrasena') !== null
  return fromProfile ? (
    <ScreenPlaceholder title={t('screens.changePassword')} backTo="/perfil" />
  ) : (
    <ScreenPlaceholder title={t('screens.firstAccess')} />
  )
}
