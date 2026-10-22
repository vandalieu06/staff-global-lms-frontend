import { Check, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { formatoDuracion, formatoTamano } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Material } from '@/types/domain'
import { iconoMaterial, nombreDescarga } from './download'

type MaterialRowProps = { material: Material; visto: boolean; to: string }

/** Fila de material (mockup 3.1): abre el visor y tiene botón de descarga de 44 px. */
export function MaterialRow({ material, visto, to }: MaterialRowProps) {
  const { t } = useTranslation()
  const Icon = iconoMaterial[material.tipo]

  const detalle = [
    t(`material.types.${material.tipo}`),
    material.paginas && t('material.pages', { count: material.paginas }),
    material.duracionSeg && t('material.duration', { duracion: formatoDuracion(material.duracionSeg) }),
    formatoTamano(material.tamanoBytes),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="flex items-center gap-1 py-1.5 pr-1 pl-3.5">
      <Link to={to} className="flex min-w-0 flex-1 items-start gap-3 py-2 text-foreground">
        <Icon
          className={cn('mt-0.5 size-[18px] shrink-0', visto ? 'text-muted-foreground' : 'text-primary')}
          aria-hidden="true"
        />
        <span className="min-w-0">
          <span className="block text-[15px] leading-snug font-semibold">{material.titulo}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
            {detalle} ·
            {visto ? (
              <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                <Check className="size-3.5" aria-hidden="true" />
                {t('chapter.seen')}
              </span>
            ) : (
              <span className="font-semibold text-primary">{t('chapter.pending')}</span>
            )}
          </span>
        </span>
      </Link>
      <a
        href={material.url}
        download={nombreDescarga(material)}
        aria-label={t('chapter.download', { tipo: t(`material.typesLower.${material.tipo}`) })}
        className="flex size-11 shrink-0 items-center justify-center rounded-[10px] text-gray-700 hover:bg-muted"
      >
        <Download className="size-[18px]" aria-hidden="true" />
      </a>
    </li>
  )
}
