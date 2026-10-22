import { act, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getProgreso, marcarMaterialVisto } from '@/lib/progress-store'
import { estadoCapitulo } from '@/lib/rules'
import { cursoDermoconsejera as curso } from '@/mocks/seed'
import type { Pregunta } from '@/types/domain'
import { conSesion, renderApp } from '@/test/helpers'

const TEST_CAP2 = '/cursos/dermoconsejera/capitulos/cap-2/test'
const cap2 = curso.capitulos[1]

/** Capítulo 1 superado y los 4 materiales del capítulo 2 vistos: el test del 2 está abierto. */
function conTestCap2Abierto() {
  conSesion({ preset: 'capitulo-2-a-medias' })
  marcarMaterialVisto(curso.id, 'cap-2-video')
  marcarMaterialVisto(curso.id, 'cap-2-audio')
}

/** Todos los capítulos superados y el test final sin hacer. */
function conTestFinalAbierto() {
  conSesion({ preset: 'curso-aprobado' })
  act(() => {
    const p = getProgreso(curso.id)
    const { ['test-final']: _, ...intentos } = p.intentos
    localStorage.setItem(
      'sgg-lms:v1:progreso',
      JSON.stringify({ v: 1, cursos: { [curso.id]: { ...p, intentos } } }),
    )
  })
}

type Usuario = ReturnType<typeof renderApp>['user']

/** Responde las preguntas en orden; `fallar` indica cuáles (por posición) se responden mal. */
async function responder(user: Usuario, preguntas: Pregunta[], fallar: number[] = []) {
  for (const [i, pregunta] of preguntas.entries()) {
    await screen.findByText(pregunta.enunciado)
    const indice = fallar.includes(i) ? (pregunta.correcta + 1) % 4 : pregunta.correcta
    await user.click(screen.getByRole('radio', { name: pregunta.respuestas[indice] }))
    const ultima = i === preguntas.length - 1
    await user.click(screen.getByRole('button', { name: ultima ? 'Ver resultado' : 'Siguiente pregunta' }))
  }
}

describe('Test · inicio', () => {
  it('muestra las condiciones y es el primer intento', async () => {
    conTestCap2Abierto()
    renderApp(TEST_CAP2)

    expect(await screen.findByRole('heading', { level: 1, name: 'Test del capítulo' })).toBeInTheDocument()
    expect(screen.getByText('· 4 aciertos')).toBeInTheDocument()
    expect(screen.getByText('Ilimitados')).toBeInTheDocument()
    expect(screen.getByText('Es tu primer intento.')).toBeInTheDocument()
  })

  it('si faltan materiales vuelve al capítulo', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    const { router } = renderApp(TEST_CAP2)

    await waitFor(() => expect(router.state.location.pathname).toBe('/cursos/dermoconsejera/capitulos/cap-2'))
  })

  it('sin intento empezado, la pregunta redirige al inicio', async () => {
    conTestCap2Abierto()
    const { router } = renderApp(`${TEST_CAP2}/intento`)

    await waitFor(() => expect(router.state.location.pathname).toBe(TEST_CAP2))
  })
})

describe('Test · preguntas y resultado', () => {
  it('3 de 5 → 60 %, «No superado», 2 falladas con explicación y acertadas plegadas', async () => {
    conTestCap2Abierto()
    const { user, router } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await responder(user, cap2.test.preguntas, [0, 3])

    expect(await screen.findByText('No superado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(`${TEST_CAP2}/resultado`)
    expect(screen.getByRole('heading', { level: 1, name: '60 %' })).toBeInTheDocument()
    expect(screen.getByText('3 de 5 correctas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Preguntas falladas · 2' })).toBeInTheDocument()
    expect(screen.getByText(cap2.test.preguntas[0].explicacion)).toBeInTheDocument()
    expect(screen.getByText(cap2.test.preguntas[3].explicacion)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preguntas acertadas · 3' })).toHaveAttribute('aria-expanded', 'false')
    expect(getProgreso(curso.id).intentos['cap-2-test']).toHaveLength(1)
  })

  it('«Siguiente» está deshabilitado sin respuesta y no hay forma de volver a la anterior', async () => {
    conTestCap2Abierto()
    const { user } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))

    expect(await screen.findByRole('button', { name: 'Siguiente pregunta' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('4 de 5 → 80 %, capítulo superado y el siguiente pasa a en curso', async () => {
    conTestCap2Abierto()
    const { user } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await responder(user, cap2.test.preguntas, [2])

    expect(await screen.findByText('Capítulo superado')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: '80 %' })).toBeInTheDocument()
    expect(screen.getByText('Necesitabas un 80 %. Superado en el intento 1.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Empezar capítulo 3' })).toHaveAttribute(
      'href',
      '/cursos/dermoconsejera/capitulos/cap-3',
    )
    expect(estadoCapitulo(curso, getProgreso(curso.id), 'cap-3')).toBe('en-curso')
    // Con falladas, también se muestran, pero plegadas.
    expect(screen.getByRole('button', { name: 'Preguntas falladas · 1' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('repetir tras suspender crea el intento 2 sin espera', async () => {
    conTestCap2Abierto()
    const { user } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await responder(user, cap2.test.preguntas, [0, 1])

    await user.click(await screen.findByRole('link', { name: 'Repetir test' }))
    expect(await screen.findByText('Último intento: 60 % (3 de 5).')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar test' }))
    await responder(user, cap2.test.preguntas)

    expect(await screen.findByText('Necesitabas un 80 %. Superado en el intento 2.')).toBeInTheDocument()
    expect(getProgreso(curso.id).intentos['cap-2-test']).toHaveLength(2)
  })
})

describe('Test · salir', () => {
  it('«Salir» pide confirmación y descarta el intento sin contarlo', async () => {
    conTestCap2Abierto()
    const { user, router } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await user.click(await screen.findByRole('radio', { name: cap2.test.preguntas[0].respuestas[0] }))

    await user.click(screen.getByRole('link', { name: 'Salir del test' }))
    const dialogo = await screen.findByRole('alertdialog')
    expect(within(dialogo).getByText('¿Salir del test?')).toBeInTheDocument()

    await user.click(within(dialogo).getByRole('button', { name: 'Seguir con el test' }))
    expect(router.state.location.pathname).toBe(`${TEST_CAP2}/intento`)
    expect(screen.getByRole('radio', { name: cap2.test.preguntas[0].respuestas[0] })).toBeChecked()

    await user.click(screen.getByRole('link', { name: 'Salir del test' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Salir' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/cursos/dermoconsejera/capitulos/cap-2'))
    expect(getProgreso(curso.id).intentos['cap-2-test']).toBeUndefined()
    expect(sessionStorage.length).toBe(0)
  })

  it('el botón atrás del navegador también pide confirmación', async () => {
    conTestCap2Abierto()
    const { user, router } = renderApp(TEST_CAP2)
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await screen.findByText(cap2.test.preguntas[0].enunciado)

    act(() => void router.navigate(-1))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe(`${TEST_CAP2}/intento`)
  })
})

describe('Test final y curso aprobado', () => {
  it('superar el test final lleva a «Has aprobado el curso» y el curso pasa a Aprobados', async () => {
    conTestFinalAbierto()
    const { user, router } = renderApp('/cursos/dermoconsejera/test-final')

    expect(await screen.findByRole('heading', { level: 1, name: 'Test final del curso' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Empezar test' }))
    await responder(user, curso.testFinal.preguntas, [0])

    expect(await screen.findByRole('heading', { level: 1, name: 'Has aprobado el curso' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cursos/dermoconsejera/aprobado')
    expect(screen.getByText('· 9 de 10')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Volver a Mis cursos' }))
    expect(await screen.findByText('Aprobados · 1')).toBeInTheDocument()
  })

  it('suspender el test final muestra el resultado, no el aprobado', async () => {
    conTestFinalAbierto()
    const { user, router } = renderApp('/cursos/dermoconsejera/test-final')
    await user.click(await screen.findByRole('button', { name: 'Empezar test' }))
    await responder(user, curso.testFinal.preguntas, [0, 1, 2])

    expect(await screen.findByText('No superado')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cursos/dermoconsejera/test-final/resultado')
  })

  it('«Has aprobado el curso» sin aprobar redirige al temario', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    const { router } = renderApp('/cursos/dermoconsejera/aprobado')

    await waitFor(() => expect(router.state.location.pathname).toBe('/cursos/dermoconsejera'))
  })
})
