import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 2.1 Mis cursos. Se implementa en la spec 03. */
export function Component() {
  const { t } = useTranslation()
  return <ScreenPlaceholder title={t('screens.courses')} />
}
