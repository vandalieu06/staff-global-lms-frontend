import { useCallback, useEffect, useState, type RefObject } from 'react'

/**
 * Estado y acciones de un `<video>` o `<audio>` nativo para los controles propios de los visores:
 * reproducción, posición, duración y velocidad.
 */
export function usePlayer(ref: RefObject<HTMLMediaElement | null>, onEnded?: () => void) {
  const [reproduciendo, setReproduciendo] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const [posicion, setPosicion] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [velocidad, setVelocidadState] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    const media = ref.current
    if (!media) return
    const handlers: Record<string, () => void> = {
      play: () => {
        setReproduciendo(true)
        setTerminado(false)
      },
      pause: () => setReproduciendo(false),
      timeupdate: () => setPosicion(media.currentTime),
      loadedmetadata: () => setDuracion(media.duration),
      durationchange: () => setDuracion(media.duration),
      ended: () => {
        setReproduciendo(false)
        setTerminado(true)
        onEnded?.()
      },
      error: () => setError(true),
    }
    for (const [evento, fn] of Object.entries(handlers)) media.addEventListener(evento, fn)
    if (media.readyState >= 1) setDuracion(media.duration)
    return () => {
      for (const [evento, fn] of Object.entries(handlers)) media.removeEventListener(evento, fn)
    }
  }, [ref, onEnded])

  const alternar = useCallback(() => {
    const media = ref.current
    if (!media) return
    if (media.paused) void media.play().catch(() => setError(true))
    else media.pause()
  }, [ref])

  const buscar = useCallback(
    (segundos: number) => {
      const media = ref.current
      if (!media) return
      media.currentTime = Math.min(Math.max(segundos, 0), media.duration || 0)
      setPosicion(media.currentTime)
    },
    [ref],
  )

  const setVelocidad = useCallback(
    (v: number) => {
      if (ref.current) ref.current.playbackRate = v
      setVelocidadState(v)
    },
    [ref],
  )

  return {
    reproduciendo,
    terminado,
    posicion,
    duracion: Number.isFinite(duracion) ? duracion : 0,
    velocidad,
    error,
    alternar,
    buscar,
    setVelocidad,
  }
}
