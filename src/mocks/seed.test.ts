import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cursoDermoconsejera as curso } from './seed'

/**
 * El seed debe reproducir exactamente el contenido de ejemplo documentado (spec 02, criterio de
 * aceptación). Se leen las preguntas del markdown y se comparan con las del seed.
 */
// Vitest se ejecuta desde la raíz del proyecto.
const markdown = readFileSync(
  resolve(process.cwd(), 'docs/contenido-ejemplo/dermoconsejeras-verano-2026.md'),
  'utf8',
)

interface PreguntaDoc {
  enunciado: string
  correcta: string
  incorrectas: string[]
  explicacion: string
}

function preguntasDelCapitulo(numero: number): PreguntaDoc[] {
  const seccion = markdown.split(/^### /m).find((s) => s.startsWith(`Capítulo ${numero} `))
  if (!seccion) throw new Error(`No se encuentra el capítulo ${numero} en el markdown`)
  return seccion
    .split(/^\*\*\d+\. /m)
    .slice(1)
    .map((bloque) => {
      const lineas = bloque.split('\n')
      const opciones = lineas.filter((l) => l.startsWith('- ')).map((l) => l.slice(2))
      return {
        enunciado: lineas[0].replace(/\*\*$/, ''),
        correcta: opciones.find((o) => o.startsWith('✅ '))!.slice(2),
        incorrectas: opciones.filter((o) => !o.startsWith('✅ ')),
        explicacion: lineas.find((l) => l.startsWith('> **Explicación:** '))!.replace('> **Explicación:** ', ''),
      }
    })
}

describe('seed', () => {
  it.each([1, 2])('capítulo %i coincide con el contenido de ejemplo', (numero) => {
    const doc = preguntasDelCapitulo(numero)
    const seed = curso.capitulos[numero - 1].test.preguntas

    expect(seed).toHaveLength(doc.length)
    seed.forEach((pregunta, i) => {
      expect(pregunta.enunciado).toBe(doc[i].enunciado)
      expect(pregunta.respuestas[pregunta.correcta]).toBe(doc[i].correcta)
      expect(pregunta.respuestas.filter((_, j) => j !== pregunta.correcta)).toEqual(doc[i].incorrectas)
      // La explicación del seed empieza en mayúscula aunque en el doc siga a «Explicación:».
      expect(pregunta.explicacion.toLowerCase()).toBe(doc[i].explicacion.toLowerCase())
    })
  })

  it('5 capítulos y test final al 80 %, con 4 respuestas por pregunta', () => {
    expect(curso.capitulos).toHaveLength(5)
    for (const t of [...curso.capitulos.map((c) => c.test), curso.testFinal]) {
      expect(t.notaMinima).toBe(80)
      for (const p of t.preguntas) expect(p.respuestas).toHaveLength(4)
    }
  })

  it('ids únicos de materiales y preguntas', () => {
    const materiales = curso.capitulos.flatMap((c) => c.materiales.map((m) => m.id))
    const preguntas = curso.capitulos.flatMap((c) => c.test.preguntas.map((p) => p.id))
    expect(new Set(materiales).size).toBe(materiales.length)
    expect(new Set(preguntas).size).toBe(preguntas.length)
  })

  it('cada material existe en public/ y su tamaño coincide con el del seed', () => {
    for (const m of curso.capitulos.flatMap((c) => c.materiales)) {
      const archivo = resolve(process.cwd(), 'public', m.url.replace(/^\//, ''))
      expect(existsSync(archivo), `${m.url} no existe: ejecuta scripts/generar-materiales-mock.sh`).toBe(true)
      expect(statSync(archivo).size, `${m.url}: actualiza tamanoBytes en seed.ts`).toBe(m.tamanoBytes)
    }
  })
})
