import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getProgreso } from '@/lib/progress-store'
import { conSesion, esperarElemento, renderApp } from '@/test/helpers'

// pdf.js necesita canvas y workers, que jsdom no tiene: el visor se sustituye por un doble.
vi.mock('./PdfViewer', () => ({
  PdfViewer: ({ url }: { url: string }) => <div data-testid="pdf">{url}</div>,
}))

const CAP2 = '/cursos/dermoconsejera/capitulos/cap-2'
const vistos = () => getProgreso('dermoconsejera').materialesVistos

describe('Capítulo · materiales', () => {
  it('con 2 de 4 vistos el test está bloqueado y dice cuántos faltan', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp(CAP2)

    expect(await screen.findByText('2 de 4 vistos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abre los 2 materiales pendientes' })).toBeDisabled()
    expect(screen.queryByRole('link', { name: 'Hacer el test' })).not.toBeInTheDocument()
  })

  it('muestra cada material con su estado y su descarga', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp(CAP2)

    const pdf = await screen.findByRole('link', { name: /Prevención de riesgos en el stand/ })
    expect(pdf).toHaveAttribute('href', `${CAP2}/materiales/cap-2-pdf`)
    expect(within(pdf).getByText('Visto')).toBeInTheDocument()
    expect(within(screen.getByRole('link', { name: /Cómo aplicar el tester/ })).getByText('Pendiente')).toBeInTheDocument()

    const descarga = screen.getByRole('link', { name: 'Descargar PDF' })
    expect(descarga).toHaveAttribute('href', '/mock/materiales/cap-2-prevencion-riesgos.pdf')
    expect(descarga).toHaveAttribute('download', 'Prevención de riesgos en el stand.pdf')
  })

  it('con los 4 vistos aparece «Hacer el test»', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp(`${CAP2}/materiales/cap-2-video`)
    fireEvent.ended(await esperarElemento('video'))
    await waitFor(() => expect(vistos()).toContain('cap-2-video'))
    cleanup()
    renderApp(`${CAP2}/materiales/cap-2-audio`)
    fireEvent.ended(await esperarElemento('audio'))
    await waitFor(() => expect(vistos()).toContain('cap-2-audio'))
    cleanup()

    renderApp(CAP2)
    expect(await screen.findByRole('link', { name: 'Hacer el test' })).toHaveAttribute('href', `${CAP2}/test`)
  })

  it('un capítulo bloqueado vuelve al temario', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    const { router } = renderApp('/cursos/dermoconsejera/capitulos/cap-3')

    await waitFor(() => expect(router.state.location.pathname).toBe('/cursos/dermoconsejera'))
  })
})

describe('Visor', () => {
  it('abrir un PDF lo marca como visto', async () => {
    conSesion()
    renderApp('/cursos/dermoconsejera/capitulos/cap-1/materiales/cap-1-pdf')

    expect(await screen.findByTestId('pdf')).toHaveTextContent('cap-1-procedimiento-operativo.pdf')
    await waitFor(() => expect(vistos()).toEqual(['cap-1-pdf']))
    expect(screen.getByText('Material 1 de 4')).toBeInTheDocument()
  })

  it('abrir una imagen la marca como vista', async () => {
    conSesion()
    renderApp('/cursos/dermoconsejera/capitulos/cap-1/materiales/cap-1-imagen')

    expect(await screen.findByRole('img', { name: 'Infografía: fichajes en GlobalApp' })).toBeInTheDocument()
    await waitFor(() => expect(vistos()).toEqual(['cap-1-imagen']))
  })

  it('el vídeo solo cuenta como visto al llegar al final', async () => {
    conSesion()
    renderApp('/cursos/dermoconsejera/capitulos/cap-1/materiales/cap-1-video')

    expect(await screen.findByText('Se marcará como visto cuando llegues al final.')).toBeInTheDocument()
    expect(vistos()).toEqual([])

    fireEvent.ended(document.querySelector('video')!)
    await waitFor(() => expect(vistos()).toEqual(['cap-1-video']))
    expect(screen.queryByText('Se marcará como visto cuando llegues al final.')).not.toBeInTheDocument()
  })

  it('«Siguiente material» lleva al siguiente pendiente', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp(`${CAP2}/materiales/cap-2-pdf`)

    expect(await screen.findByRole('link', { name: 'Siguiente material' })).toHaveAttribute(
      'href',
      `${CAP2}/materiales/cap-2-video`,
    )
  })

  it('al terminar el último pendiente ofrece ir al test', async () => {
    conSesion({ preset: 'capitulo-2-a-medias' })
    renderApp(`${CAP2}/materiales/cap-2-video`)
    fireEvent.ended(await esperarElemento('video'))
    await waitFor(() => expect(vistos()).toContain('cap-2-video'))
    cleanup()

    renderApp(`${CAP2}/materiales/cap-2-audio`)
    fireEvent.ended(await esperarElemento('audio'))

    expect(await screen.findByText('Has revisado los 4 materiales.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir al test del capítulo' })).toHaveAttribute('href', `${CAP2}/test`)
  })
})
