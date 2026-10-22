import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { conSesion, renderApp } from '@/test/helpers'

// Las rutas del test (4.x) dependen del progreso y se prueban en features/test/test.test.tsx.
const cases: Array<[path: string, title: string, hasBottomNav: boolean]> = [
  ['/', 'Mis cursos', true],
  ['/perfil', 'Perfil', true],
  ['/perfil/contrasena', 'Cambiar contraseña', false],
  ['/cursos/dermoconsejera', 'Dermoconsejera', false],
  [
    '/cursos/dermoconsejera/capitulos/cap-1',
    'Procedimiento operativo SGG: organización, jornada y GlobalApp',
    false,
  ],
  [
    '/cursos/dermoconsejera/capitulos/cap-1/materiales/cap-1-imagen',
    'Infografía: fichajes en GlobalApp',
    false,
  ],
]

describe('router', () => {
  it.each(cases)('%s muestra «%s»', async (path, title, hasBottomNav) => {
    conSesion()
    renderApp(path)

    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    const nav = screen.queryByRole('navigation', { name: 'Navegación principal' })
    if (hasBottomNav) expect(nav).toBeInTheDocument()
    else expect(nav).not.toBeInTheDocument()
  })

  it('el login es público', async () => {
    renderApp('/login')
    expect(await screen.findByRole('heading', { level: 1, name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('una ruta desconocida muestra el 404 con enlace a Mis cursos', async () => {
    renderApp('/no-existe')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a Mis cursos' })).toHaveAttribute('href', '/')
  })

  it('los detalles tienen botón de volver hacia su pantalla padre', async () => {
    conSesion()
    renderApp('/cursos/dermoconsejera/capitulos/cap-1')

    expect(await screen.findByRole('link', { name: 'Volver' })).toHaveAttribute(
      'href',
      '/cursos/dermoconsejera',
    )
  })
})
