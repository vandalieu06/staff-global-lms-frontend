import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './router'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

const cases: Array<[path: string, title: string, hasBottomNav: boolean]> = [
  ['/login', 'Iniciar sesión', false],
  ['/primer-acceso', 'Crea tu contraseña', false],
  ['/', 'Mis cursos', true],
  ['/perfil', 'Perfil', true],
  ['/perfil/contrasena', 'Cambiar contraseña', false],
  ['/cursos/dermoconsejera', 'Curso', false],
  ['/cursos/dermoconsejera/capitulos/cap-2', 'Capítulo', false],
  ['/cursos/dermoconsejera/capitulos/cap-2/materiales/mat-1', 'Material', false],
  ['/cursos/dermoconsejera/capitulos/cap-2/test', 'Test del capítulo', false],
  ['/cursos/dermoconsejera/capitulos/cap-2/test/intento', 'Pregunta', false],
  ['/cursos/dermoconsejera/capitulos/cap-2/test/resultado', 'Resultado del test', false],
  ['/cursos/dermoconsejera/test-final', 'Test final del curso', false],
  ['/cursos/dermoconsejera/test-final/intento', 'Pregunta del test final', false],
  ['/cursos/dermoconsejera/test-final/resultado', 'Resultado del test final', false],
  ['/cursos/dermoconsejera/aprobado', 'Has aprobado el curso', false],
]

describe('router', () => {
  it.each(cases)('%s muestra «%s»', async (path, title, hasBottomNav) => {
    renderAt(path)

    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    const nav = screen.queryByRole('navigation', { name: 'Navegación principal' })
    if (hasBottomNav) expect(nav).toBeInTheDocument()
    else expect(nav).not.toBeInTheDocument()
  })

  it('una ruta desconocida muestra el 404 con enlace a Mis cursos', async () => {
    renderAt('/no-existe')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a Mis cursos' })).toHaveAttribute('href', '/')
  })

  it('los detalles tienen botón de volver hacia su pantalla padre', async () => {
    renderAt('/cursos/dermoconsejera/capitulos/cap-2')

    expect(await screen.findByRole('link', { name: 'Volver' })).toHaveAttribute(
      'href',
      '/cursos/dermoconsejera',
    )
  })
})
