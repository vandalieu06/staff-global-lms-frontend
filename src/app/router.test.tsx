import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { conSesion, renderApp } from '@/test/helpers'

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
