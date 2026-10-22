import { Pause, Play, RotateCcw } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Slider } from '@/components/ui/slider'
import { formatoDuracion } from '@/lib/format'
import { cn } from '@/lib/utils'
import { usePlayer } from './usePlayer'

/**
 * Reproductor de vídeo (mockup 3.3): `<video>` nativo en línea con controles propios. Avisa con
 * `onEnded` al llegar al final, que es cuando el vídeo cuenta como visto.
 */
export function VideoPlayer({ url, onEnded }: { url: string; onEnded: () => void }) {
  const { t } = useTranslation()
  const video = useRef<HTMLVideoElement>(null)
  const p = usePlayer(video, onEnded)
  const Icon = p.reproduciendo ? Pause : p.terminado ? RotateCcw : Play
  const etiqueta = p.reproduciendo
    ? t('material.player.pause')
    : p.terminado
      ? t('material.player.replay')
      : t('material.player.play')

  return (
    <section aria-label={t('material.types.video')} className="bg-gray-900 text-white">
      <div className="relative flex aspect-video items-center justify-center">
        <video
          ref={video}
          src={url}
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-contain"
          onClick={p.alternar}
        />
        <button
          type="button"
          onClick={p.alternar}
          aria-label={etiqueta}
          className={cn(
            'relative flex size-[60px] items-center justify-center rounded-full bg-white/16 transition-opacity',
            p.reproduciendo && 'opacity-0 hover:opacity-100 focus-visible:opacity-100',
          )}
        >
          <Icon className={cn('size-6', !p.terminado && 'fill-current')} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-2 px-3.5 pt-1 pb-3">
        <Slider
          className="py-2 **:data-[slot=slider-range]:bg-brand-200 **:data-[slot=slider-track]:bg-white/24"
          value={[p.posicion]}
          max={p.duracion || 1}
          step={0.1}
          onValueChange={([v]) => p.buscar(v)}
          thumbLabel={t('material.player.position')}
          thumbValueText={`${formatoDuracion(p.posicion)} / ${formatoDuracion(p.duracion)}`}
        />
        <div className="flex justify-between text-xs text-gray-300 tabular-nums">
          <span>{formatoDuracion(p.posicion)}</span>
          <span>{formatoDuracion(p.duracion)}</span>
        </div>
        {p.error && <p role="alert" className="text-sm text-red-200">{t('material.player.error')}</p>}
      </div>
    </section>
  )
}
