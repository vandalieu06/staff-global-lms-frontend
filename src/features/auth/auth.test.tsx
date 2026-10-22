import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { conSesion, EMAIL, PASSWORD, renderApp } from '@/test/helpers'

describe('login', () => {
  it('credenciales erróneas muestran el error y no entran', async () => {
    const { user, router } = renderApp('/login')

    await user.type(await screen.findByLabelText('Email'), EMAIL)
    await user.type(screen.getByLabelText('Contraseña'), 'mala')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText(/Email o contraseña incorrectos/)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('valida los campos antes de enviar', async () => {
    const { user } = renderApp('/login')

    await user.click(await screen.findByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Escribe tu email')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña')).toBeInTheDocument()
  })

  it('el primer acceso lleva a crear la contraseña', async () => {
    const { user, router } = renderApp('/login')

    await user.type(await screen.findByLabelText('Email'), EMAIL)
    await user.type(screen.getByLabelText('Contraseña'), PASSWORD)
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Crea tu contraseña' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/primer-acceso')
  })

  it('el botón de mostrar contraseña la hace visible', async () => {
    const { user } = renderApp('/login')
    const campo = await screen.findByLabelText('Contraseña')

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(campo).toHaveAttribute('type', 'text')
  })
})

describe('primer acceso', () => {
  it('guardar se activa solo con los 3 requisitos y lleva a Mis cursos', async () => {
    conSesion({ primerAcceso: true })
    const { user, router } = renderApp('/primer-acceso')
    const guardar = await screen.findByRole('button', { name: 'Guardar y entrar' })

    await user.type(screen.getByLabelText('Nueva contraseña'), 'eucerin')
    expect(guardar).toBeDisabled()

    await user.clear(screen.getByLabelText('Nueva contraseña'))
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Eucerin2026')
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Eucerin20')
    expect(guardar).toBeDisabled()

    await user.type(screen.getByLabelText('Repite la contraseña'), '26')
    expect(guardar).toBeEnabled()

    await user.click(guardar)
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis cursos' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('con la contraseña provisional no se puede ir a otra pantalla', async () => {
    conSesion({ primerAcceso: true })
    const { router } = renderApp('/perfil')

    expect(await screen.findByRole('heading', { name: 'Crea tu contraseña' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/primer-acceso')
  })
})

describe('cambio de contraseña desde Perfil', () => {
  it('pide la contraseña actual y avisa si es incorrecta', async () => {
    conSesion()
    const { user, router } = renderApp('/perfil/contrasena')

    await user.type(await screen.findByLabelText('Contraseña actual'), 'mala')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'Otra2026x')
    await user.type(screen.getByLabelText('Repite la contraseña'), 'Otra2026x')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))

    expect(await screen.findByText('La contraseña actual no es correcta')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Contraseña actual'))
    await user.type(screen.getByLabelText('Contraseña actual'), 'Eucerin2026')
    await user.click(screen.getByRole('button', { name: 'Guardar contraseña' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/perfil'))
  })
})

describe('guardas', () => {
  it('sin sesión cualquier ruta privada redirige al login', async () => {
    const { router } = renderApp('/cursos/dermoconsejera')

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('con sesión, el login redirige a Mis cursos', async () => {
    conSesion()
    renderApp('/login')
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis cursos' })).toBeInTheDocument()
  })
})
