import { useTranslation } from 'react-i18next'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'
import { useTestScope } from './useTestScope'

/** 4.1 Test · inicio (capítulo o test final). Se implementa en la spec 05. */
export function Component() {
  const { t } = useTranslation()
  const { isFinal, exitTo } = useTestScope()
  return (
    <ScreenPlaceholder
      title={isFinal ? t('screens.finalTestStart') : t('screens.testStart')}
      backTo={exitTo}
    />
  )
}
