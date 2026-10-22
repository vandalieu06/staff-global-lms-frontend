import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 4.5 Curso aprobado. Se implementa en la spec 05. */
export function Component() {
  const { t } = useTranslation()
  return <ScreenPlaceholder title={t('screens.courseApproved')} backTo="/" icon="close" />
}
