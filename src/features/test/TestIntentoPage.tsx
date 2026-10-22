import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'
import { useTestScope } from './useTestScope'

/** 4.2 Test · pregunta (capítulo o test final). Se implementa en la spec 05. */
export function Component() {
  const { t } = useTranslation()
  const { isFinal, exitTo } = useTestScope()
  return (
    <ScreenPlaceholder
      title={isFinal ? t('screens.finalTestAttempt') : t('screens.testAttempt')}
      backTo={exitTo}
      icon="close"
    />
  )
}
