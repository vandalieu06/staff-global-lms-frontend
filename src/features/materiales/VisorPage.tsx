import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder'

/** 3.2–3.4 Visor de PDF, imagen, vídeo o audio. Se implementa en la spec 04. */
export function Component() {
  const { t } = useTranslation()
  const { cursoId, capituloId } = useParams()
  return (
    <ScreenPlaceholder
      title={t('screens.material')}
      backTo={`/cursos/${cursoId}/capitulos/${capituloId}`}
      icon="close"
    />
  )
}
