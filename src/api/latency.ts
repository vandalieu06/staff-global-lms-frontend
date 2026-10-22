/**
 * Simula la latencia de red de una API real (200–400 ms) para que las pantallas muestren sus
 * estados de carga. En los tests no hay espera.
 */
export function simularLatencia(): Promise<void> {
  if (import.meta.env.MODE === 'test') return Promise.resolve()
  const ms = 200 + Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, ms))
}
