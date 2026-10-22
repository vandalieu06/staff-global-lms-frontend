import { Headphones, Pause, Play, RotateCcw } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatoDuracion } from '@/lib/format'
import { cn } from '@/lib/utils'
import { usePlayer } from './usePlayer'

const VELOCIDADES = [1, 1.5, 2] as const

/**
 * Reproductor de audio (mockup 3.4): portada plana de marca, barra de posición, retroceder 15 s,
 * reproducir/pausar y velocidad. Avisa con `onEnded` al llegar al final.
 */
export function AudioPlayer({ url, titulo, onEnded }: { url: string; titulo: string; onEnded: () => void }) {
  const { t } = useTranslation()
  const audio = useRef<HTMLAudioElement>(null)
  const p = usePlayer(audio, onEnded)
  const Icon = p.reproduciendo ? Pause : p.terminado ? RotateCcw : Play
  const siguienteVelocidad = VELOCIDADES[(VELOCIDADES.indexOf(p.velocidad as 1) + 1) % VELOCIDADES.length]

  return (
    <section aria-label={t('material.types.audio')} className="flex flex-col gap-[22px]">
      <audio ref={audio} src={url} preload="metadata" />
      <div className="flex h-[220px] flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground">
        <Headphones className="size-8 text-brand-100" aria-hidden="true" />
        <p className="text-[22px] leading-tight font-bold tracking-tight">{titulo}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Slider
          className="py-2"
          value={[p.posicion]}
          max={p.duracion || 1}
          step={0.1}
          onValueChange={([v]) => p.buscar(v)}
          thumbLabel={t('material.player.position')}
          thumbValueText={`${formatoDuracion(p.posicion)} / ${formatoDuracion(p.duracion)}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>{formatoDuracion(p.posicion)}</span>
          <span>{formatoDuracion(p.duracion)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-[22px]">
        <Button
          variant="ghost"
          className="relative size-[52px] rounded-full"
          aria-label={t('material.player.back15')}
          onClick={() => p.buscar(p.posicion - 15)}
        >
          <RotateCcw className="size-[30px]!" aria-hidden="true" />
          <span className="absolute text-[9px] font-bold" aria-hidden="true">15</span>
        </Button>
        <Button
          className="size-[68px] rounded-full"
          aria-label={
            p.reproduciendo
              ? t('material.player.pause')
              : p.terminado
                ? t('material.player.replay')
                : t('material.player.play')
          }
          onClick={p.alternar}
        >
          <Icon className={cn('size-7!', !p.terminado && 'fill-current')} aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          className="size-[52px] rounded-full text-[15px] font-bold"
          aria-label={t('material.player.speed', { velocidad: p.velocidad })}
          onClick={() => p.setVelocidad(siguienteVelocidad)}
        >
          {p.velocidad.toLocaleString('es')}×
        </Button>
      </div>
      {p.error && <p role="alert" className="text-sm text-red-700">{t('material.player.error')}</p>}
    </section>
  )
}
