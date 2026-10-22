import type {
  Capitulo,
  Curso,
  EstadoCapitulo,
  EstadoTestFinal,
  IndiceRespuesta,
  Intento,
  Pregunta,
  ProgresoCurso,
  Test,
} from '@/types/domain'

/**
 * Reglas de negocio del LMS (docs/decisiones.md §3–§4) como funciones puras: no leen ni escriben
 * almacenamiento, reciben el curso y el progreso del alumno.
 */

// ---------- Tests ----------

/** Aciertos necesarios para alcanzar la nota mínima: ⌈n × nota / 100⌉. */
export function aciertosNecesarios(totalPreguntas: number, notaMinima: number): number {
  // El épsilon evita que errores de coma flotante sumen un acierto de más (p. ej. 15 × 80 / 100).
  return Math.ceil((totalPreguntas * notaMinima) / 100 - 1e-9)
}

export interface DetallePregunta {
  pregunta: Pregunta
  elegida: IndiceRespuesta
  acertada: boolean
}

export interface Correccion {
  aciertos: number
  total: number
  /** Entero 0–100. */
  porcentaje: number
  superado: boolean
  necesarios: number
  falladas: DetallePregunta[]
  acertadas: DetallePregunta[]
}

/**
 * Corrige un intento. `respuestas[i]` es el índice elegido para `test.preguntas[i]` sobre el
 * orden original de las respuestas.
 */
export function corregir(test: Test, respuestas: readonly IndiceRespuesta[]): Correccion {
  if (respuestas.length !== test.preguntas.length) {
    throw new Error(
      `Se esperaban ${test.preguntas.length} respuestas y llegaron ${respuestas.length}`,
    )
  }
  const detalle = test.preguntas.map((pregunta, i) => ({
    pregunta,
    elegida: respuestas[i],
    acertada: respuestas[i] === pregunta.correcta,
  }))
  const aciertos = detalle.filter((d) => d.acertada).length
  const total = test.preguntas.length
  const necesarios = aciertosNecesarios(total, test.notaMinima)

  return {
    aciertos,
    total,
    porcentaje: total === 0 ? 0 : Math.round((aciertos / total) * 100),
    superado: total > 0 && aciertos >= necesarios,
    necesarios,
    falladas: detalle.filter((d) => !d.acertada),
    acertadas: detalle.filter((d) => d.acertada),
  }
}

export function intentosDe(progreso: ProgresoCurso, testId: string): Intento[] {
  return progreso.intentos[testId] ?? []
}

export function testSuperado(progreso: ProgresoCurso, testId: string): boolean {
  return intentosDe(progreso, testId).some((i) => i.superado)
}

/** Mejor intento (mayor porcentaje; a igualdad, el más antiguo). */
export function mejorIntento(progreso: ProgresoCurso, testId: string): Intento | undefined {
  return intentosDe(progreso, testId).reduce<Intento | undefined>(
    (mejor, i) => (!mejor || i.porcentaje > mejor.porcentaje ? i : mejor),
    undefined,
  )
}

/** Primer intento superado (para «Superado en el intento N»). */
export function intentoQueSupero(progreso: ProgresoCurso, testId: string) {
  const intentos = intentosDe(progreso, testId)
  const indice = intentos.findIndex((i) => i.superado)
  return indice === -1 ? undefined : { intento: intentos[indice], numero: indice + 1 }
}

// ---------- Materiales ----------

export function materialesVistos(capitulo: Capitulo, progreso: ProgresoCurso): number {
  return capitulo.materiales.filter((m) => progreso.materialesVistos.includes(m.id)).length
}

export function materialesPendientes(capitulo: Capitulo, progreso: ProgresoCurso): number {
  return capitulo.materiales.length - materialesVistos(capitulo, progreso)
}

/** El test se abre cuando se han visto todos los materiales y el capítulo tiene contenido. */
export function testDesbloqueado(capitulo: Capitulo, progreso: ProgresoCurso): boolean {
  return !capitulo.contenidoPendiente && materialesPendientes(capitulo, progreso) === 0
}

// ---------- Capítulos y curso ----------

/**
 * Estado de cada capítulo: se superan en orden; el primero no superado está «en curso» y los
 * siguientes, bloqueados.
 */
export function estadosCapitulos(curso: Curso, progreso: ProgresoCurso): Map<string, EstadoCapitulo> {
  const estados = new Map<string, EstadoCapitulo>()
  let encontradoEnCurso = false
  for (const capitulo of curso.capitulos) {
    if (!encontradoEnCurso && testSuperado(progreso, capitulo.test.id)) {
      estados.set(capitulo.id, 'superado')
    } else if (!encontradoEnCurso) {
      estados.set(capitulo.id, 'en-curso')
      encontradoEnCurso = true
    } else {
      estados.set(capitulo.id, 'bloqueado')
    }
  }
  return estados
}

export function estadoCapitulo(curso: Curso, progreso: ProgresoCurso, capituloId: string) {
  const estado = estadosCapitulos(curso, progreso).get(capituloId)
  if (!estado) throw new Error(`El capítulo ${capituloId} no pertenece al curso ${curso.id}`)
  return estado
}

export function estadoTestFinal(curso: Curso, progreso: ProgresoCurso): EstadoTestFinal {
  if (testSuperado(progreso, curso.testFinal.id)) return 'superado'
  const todos = [...estadosCapitulos(curso, progreso).values()].every((e) => e === 'superado')
  return todos ? 'disponible' : 'bloqueado'
}

export function cursoAprobado(curso: Curso, progreso: ProgresoCurso): boolean {
  return testSuperado(progreso, curso.testFinal.id)
}

export interface ProgresoResumen {
  superados: number
  total: number
  /** Entero 0–100. */
  porcentaje: number
}

/** Pasos superados sobre el total: cada capítulo y el test final cuentan como un paso. */
export function progresoCurso(curso: Curso, progreso: ProgresoCurso): ProgresoResumen {
  const capitulosSuperados = [...estadosCapitulos(curso, progreso).values()].filter(
    (e) => e === 'superado',
  ).length
  const superados = capitulosSuperados + (cursoAprobado(curso, progreso) ? 1 : 0)
  const total = curso.capitulos.length + 1
  return { superados, total, porcentaje: Math.round((superados / total) * 100) }
}

export type SiguientePaso =
  | { tipo: 'capitulo'; capitulo: Capitulo }
  | { tipo: 'test-final' }
  | { tipo: 'aprobado' }

export function siguientePaso(curso: Curso, progreso: ProgresoCurso): SiguientePaso {
  if (cursoAprobado(curso, progreso)) return { tipo: 'aprobado' }
  const estados = estadosCapitulos(curso, progreso)
  const capitulo = curso.capitulos.find((c) => estados.get(c.id) === 'en-curso')
  return capitulo ? { tipo: 'capitulo', capitulo } : { tipo: 'test-final' }
}
