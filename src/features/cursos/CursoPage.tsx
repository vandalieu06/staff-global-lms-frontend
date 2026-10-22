import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 2.2 Curso · temario. Se implementa en la spec 03. */
export function Component() {
  const { t } = useTranslation()
  return <ScreenPlaceholder title={t('screens.course')} backTo="/" />
}
