const bytes = new Intl.NumberFormat('es', { maximumFractionDigits: 1 })

/** 152913 → «149 KB»; 2516582 → «2,4 MB». */
export function formatoTamano(tamano: number): string {
  if (tamano < 1024 * 1024) return `${Math.max(1, Math.round(tamano / 1024))} KB`
  return `${bytes.format(tamano / (1024 * 1024))} MB`
}

/** 220 → «3:40»; 20 → «0:20». */
export function formatoDuracion(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
