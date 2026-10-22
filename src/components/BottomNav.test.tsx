import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BottomNav } from './BottomNav'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNav />
    </MemoryRouter>,
  )
}

describe('BottomNav', () => {
  it('marca Mis cursos como activa en /', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: 'Mis cursos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Perfil' })).not.toHaveAttribute('aria-current')
  })

  it('marca Perfil como activa en /perfil', () => {
    renderAt('/perfil')

    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Mis cursos' })).not.toHaveAttribute('aria-current')
  })
})
