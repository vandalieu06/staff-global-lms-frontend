import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@/lib/i18n'

// jsdom no implementa scrollTo (lo usa ScrollRestoration de React Router).
vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

// jsdom tampoco trae ResizeObserver (lo usa el Slider de Radix).
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  cleanup()
  // Cada test empieza sin sesión ni progreso guardados.
  localStorage.clear()
})
