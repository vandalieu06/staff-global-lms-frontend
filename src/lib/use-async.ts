import { useCallback, useEffect, useState, type DependencyList } from 'react'

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: unknown }

/**
 * Ejecuta una llamada asíncrona a `api/` y expone su estado (carga, datos, error) más `reload`.
 * Descarta respuestas de llamadas anteriores si cambian las dependencias.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let vigente = true
    setState({ status: 'loading' })
    fn().then(
      (data) => vigente && setState({ status: 'success', data }),
      (error: unknown) => vigente && setState({ status: 'error', error }),
    )
    return () => {
      vigente = false
    }
    // `fn` cambia en cada render; las dependencias reales las pasa quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, reload }
}
