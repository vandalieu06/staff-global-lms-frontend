import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** Reglas de dependencias entre capas (AGENTS.md › Convenciones). */

function archivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivos(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : [],
  )
}

const src = resolve(process.cwd(), 'src')

describe('arquitectura', () => {
  it.each(['features', 'components', 'app'])('src/%s no importa de @/mocks', (carpeta) => {
    const infractores = archivos(join(src, carpeta)).filter((f) =>
      /from ['"]@\/mocks/.test(readFileSync(f, 'utf8')),
    )
    expect(infractores).toEqual([])
  })
})
