import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 3.1 Capítulo · materiales. Se implementa en la spec 04. */
export function Component() {
  const { t } = useTranslation()
  const { cursoId } = useParams()
  return <ScreenPlaceholder title={t('screens.chapter')} backTo={`/cursos/${cursoId}`} />
}
