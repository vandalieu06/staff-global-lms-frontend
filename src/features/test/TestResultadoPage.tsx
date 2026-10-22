import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'
import { useTestScope } from './useTestScope'

/** 4.3 / 4.4 Resultado del test (capítulo o test final). Se implementa en la spec 05. */
export function Component() {
  const { t } = useTranslation()
  const { isFinal, exitTo } = useTestScope()
  return (
    <ScreenPlaceholder
      title={isFinal ? t('screens.finalTestResult') : t('screens.testResult')}
      backTo={exitTo}
      icon="close"
    />
  )
}
