import { useSyncExternalStore } from 'react'

export interface LocalStore<T> {
  get(): T
  set(value: T): void
  update(fn: (value: T) => T): void
  reset(): void
  subscribe(listener: () => void): () => void
  /** Hook de React: re-renderiza cuando cambia el valor (también desde otra pestaña). */
  use(): T
}

/**
 * Valor JSON persistido en `localStorage` bajo una clave versionada. Si el contenido falta, no es
 * JSON válido o no pasa `isValid`, se usa `fallback()`. La instantánea se cachea por el texto
 * guardado, así `useSyncExternalStore` recibe siempre la misma referencia mientras no cambie.
 */
export function createLocalStore<T>(
  key: string,
  fallback: () => T,
  isValid: (value: unknown) => value is T,
): LocalStore<T> {
  const listeners = new Set<() => void>()
  let cachedRaw: string | null | undefined
  let cachedValue: T = fallback()
  // Copia en memoria para cuando `localStorage` no está disponible (modo privado, cuota llena).
  let memoryRaw: string | null = null

  function readRaw(): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return memoryRaw
    }
  }

  function get(): T {
    const raw = readRaw()
    if (raw === cachedRaw) return cachedValue
    cachedRaw = raw
    cachedValue = parse(raw)
    return cachedValue
  }

  function parse(raw: string | null): T {
    if (raw === null) return fallback()
    try {
      const value: unknown = JSON.parse(raw)
      return isValid(value) ? value : fallback()
    } catch {
      return fallback()
    }
  }

  function emit() {
    for (const listener of listeners) listener()
  }

  function set(value: T) {
    const raw = JSON.stringify(value)
    try {
      localStorage.setItem(key, raw)
    } catch {
      memoryRaw = raw
    }
    emit()
  }

  function reset() {
    try {
      localStorage.removeItem(key)
    } catch {
      memoryRaw = null
    }
    emit()
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  return {
    get,
    set,
    update: (fn) => set(fn(get())),
    reset,
    subscribe,
    use: () => useSyncExternalStore(subscribe, get, get),
  }
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
