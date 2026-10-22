import { reemplazarProgreso, reiniciarProgreso } from '@/lib/progress-store'
import { cerrarSesion } from '@/lib/session-store'
import { presets, type PresetId } from '@/mocks/demo-presets'
import { cuentasStore } from './auth'

/** Herramientas del panel de demo (solo prototipo, `VITE_DEMO=true`). */

export const presetsDemo = presets.map(({ id, labelKey }) => ({ id, labelKey }))
export type { PresetId }

export function aplicarPreset(id: PresetId) {
  const preset = presets.find((p) => p.id === id)
  if (!preset) throw new Error(`Preset desconocido: ${id}`)
  reemplazarProgreso(preset.progreso())
}

/** Borra progreso, cambios de contraseña y sesión: vuelve al estado de la invitación. */
export function reiniciarDemo() {
  reiniciarProgreso()
  cuentasStore.reset()
  cerrarSesion()
}
