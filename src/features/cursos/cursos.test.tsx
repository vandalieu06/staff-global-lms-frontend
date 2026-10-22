import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { aplicarPreset } from '@/api/demo'
import { conSesion, renderApp } from '@/test/helpers'

describe('Mis cursos', () => {
  it('sin progreso: curso en curso, 0 de 6 y «Empezar curso»', async () => {
    conSesion()
    renderApp('/')

    expect(await screen.findByText('0 de 6 superados')).toBeInTheDocument()
    expect(screen.getByText('En curso · 1')).toBeInTheDocument()
    expect(screen.getByText('Aprobados · 0')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Empezar curso' })).toHaveAttribute('href', '/cursos/dermoconsejera')
  })

  it('con el preset «Capítulo 2 a medias»: 1 de 6 y siguiente el capítulo 2', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp('/')

    expect(await screen.findByText('1 de 6 superados')).toBeInTheDocument()
    expect(screen.getByText('Capítulo 2 · Normativa aplicable')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continuar curso' })).toBeInTheDocument()
  })

  it('un curso aprobado pasa a la sección Aprobados con su nota', async () => {
    conSesion({ preset: 'curso-aprobado' })
    renderApp('/')

    expect(await screen.findByText('Aprobados · 1')).toBeInTheDocument()
    expect(screen.getByText('En curso · 0')).toBeInTheDocument()
    expect(screen.getByText('Aprobado · 90 % en el test final')).toBeInTheDocument()
  })

  it('se actualiza al cambiar el progreso sin recargar', async () => {
    conSesion()
    renderApp('/')
    expect(await screen.findByText('0 de 6 superados')).toBeInTheDocument()

    act(() => aplicarPreset('capitulo-2-a-medias'))
    expect(await screen.findByText('1 de 6 superados')).toBeInTheDocument()
  })
})

describe('Curso · temario', () => {
  it('marca el 1 superado, el 2 en curso y del 3 en adelante bloqueados', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp('/cursos/dermoconsejera')

    const temario = await screen.findByRole('list', { name: 'Temario' })
    const pasos = within(temario).getAllByRole('listitem')
    expect(pasos).toHaveLength(6)

    expect(within(pasos[0]).getByText('Superado · 100 %')).toBeInTheDocument()
    expect(within(pasos[0]).getByRole('link')).toHaveAttribute('href', '/cursos/dermoconsejera/capitulos/cap-1')

    expect(pasos[1]).toHaveAttribute('aria-current', 'step')
    expect(within(pasos[1]).getByText('En curso · 2 de 4 materiales vistos')).toBeInTheDocument()

    for (const paso of pasos.slice(2)) expect(within(paso).queryByRole('link')).not.toBeInTheDocument()
    expect(within(pasos[2]).getByText('Se abre al superar el capítulo 2')).toBeInTheDocument()
    expect(within(pasos[5]).getByText(/se abre al superar los 5 capítulos/)).toBeInTheDocument()
  })

  it('un curso no asignado muestra el aviso', async () => {
    conSesion()
    renderApp('/cursos/otro')
    expect(await screen.findByText('Este curso no existe o no lo tienes asignado.')).toBeInTheDocument()
  })
})

describe('Perfil', () => {
  it('muestra los datos y el resumen de cursos', async () => {
    conSesion({ preset: 'curso-aprobado' })
    renderApp('/perfil')

    expect(await screen.findAllByText('lucia.fernandez@email.com')).toHaveLength(2)
    const asignados = screen.getByText('Cursos asignados').parentElement!
    expect(await within(asignados).findByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('Cursos aprobados').parentElement!).getByText('1')).toBeInTheDocument()
  })

  it('cerrar sesión pide confirmación y vuelve al login', async () => {
    conSesion()
    const { user, router } = renderApp('/perfil')

    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    const dialogo = await screen.findByRole('alertdialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Cerrar sesión' }))

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('el panel de demo aplica presets', async () => {
    conSesion()
    const { user } = renderApp('/perfil')

    await user.click(await screen.findByRole('button', { name: 'Curso aprobado' }))
    const aprobados = screen.getByText('Cursos aprobados').parentElement!
    expect(await within(aprobados).findByText('1')).toBeInTheDocument()
  })
})
