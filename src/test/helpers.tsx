import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { cuentasStore } from '@/api/auth'
import { aplicarPreset, type PresetId } from '@/api/demo'
import { routes } from '@/app/router'
import { iniciarSesion } from '@/lib/session-store'

export const EMAIL = 'lucia.fernandez@email.com'
export const PASSWORD = 'provisional'

/** Deja a la alumna demo con sesión iniciada. Por defecto, ya ha cambiado la contraseña. */
export function conSesion({ primerAcceso = false, preset }: { primerAcceso?: boolean; preset?: PresetId } = {}) {
  if (!primerAcceso) {
    cuentasStore.set({ v: 1, cuentas: { 'u-lucia': { mustChangePassword: false, password: 'Eucerin2026' } } })
  }
  iniciarSesion('u-lucia')
  if (preset) aplicarPreset(preset)
}

/** Monta la app completa en una ruta. */
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const user = userEvent.setup()
  render(<RouterProvider router={router} />)
  return { router, user }
}

/** Espera a que exista un elemento que no tiene rol accesible (p. ej. `<video>`). */
export function esperarElemento<T extends Element>(selector: string): Promise<T> {
  return waitFor(() => {
    const el = document.querySelector<T>(selector)
    if (!el) throw new Error(`No aparece ${selector}`)
    return el
  })
}
