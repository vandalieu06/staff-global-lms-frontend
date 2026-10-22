import { getProgreso, marcarMaterialVisto as guardarVisto, registrarIntento } from '@/lib/progress-store'
import {
  corregir,
  estadoCapitulo,
  estadoTestFinal,
  testDesbloqueado,
  type Correccion,
} from '@/lib/rules'
import { cursos } from '@/mocks/seed'
import type { Capitulo, Curso, IndiceRespuesta, Intento, Material, Test } from '@/types/domain'
import { requerirUsuario } from './auth'
import { Bloqueado, NoEncontrado } from './errors'
import { simularLatencia } from './latency'

/**
 * Acceso a cursos, capítulos, materiales y tests (mock). Aplica las mismas comprobaciones que
 * haría el backend: sesión, curso asignado y desbloqueo según el progreso del alumno.
 */

function cursoAsignado(cursoId: string): Curso {
  const usuario = requerirUsuario()
  const curso = cursos.find((c) => c.id === cursoId)
  if (!curso || !usuario.cursosAsignados.includes(cursoId)) throw new NoEncontrado(`curso ${cursoId}`)
  return curso
}

function capituloDe(curso: Curso, capituloId: string): Capitulo {
  const capitulo = curso.capitulos.find((c) => c.id === capituloId)
  if (!capitulo) throw new NoEncontrado(`capítulo ${capituloId}`)
  return capitulo
}

/** Capítulo accesible: superado o en curso. */
function capituloAccesible(curso: Curso, capituloId: string): Capitulo {
  const capitulo = capituloDe(curso, capituloId)
  if (estadoCapitulo(curso, getProgreso(curso.id), capituloId) === 'bloqueado') {
    throw new Bloqueado(`capítulo ${capituloId}`)
  }
  return capitulo
}

/** Test de un capítulo (`capituloId`) o test final del curso (`capituloId` nulo). */
function testAccesible(curso: Curso, capituloId: string | null): Test {
  const progreso = getProgreso(curso.id)
  if (capituloId === null) {
    if (estadoTestFinal(curso, progreso) === 'bloqueado') throw new Bloqueado('test final')
    return curso.testFinal
  }
  const capitulo = capituloAccesible(curso, capituloId)
  if (!testDesbloqueado(capitulo, progreso)) throw new Bloqueado(`test del ${capituloId}`)
  return capitulo.test
}

export async function getCursosAsignados(): Promise<Curso[]> {
  await simularLatencia()
  const usuario = requerirUsuario()
  return cursos.filter((c) => usuario.cursosAsignados.includes(c.id))
}

export async function getCurso(cursoId: string): Promise<Curso> {
  await simularLatencia()
  return cursoAsignado(cursoId)
}

export async function getCapitulo(cursoId: string, capituloId: string): Promise<Capitulo> {
  await simularLatencia()
  return capituloAccesible(cursoAsignado(cursoId), capituloId)
}

export async function getMaterial(
  cursoId: string,
  capituloId: string,
  materialId: string,
): Promise<{ material: Material; indice: number; capitulo: Capitulo }> {
  await simularLatencia()
  const capitulo = capituloAccesible(cursoAsignado(cursoId), capituloId)
  const indice = capitulo.materiales.findIndex((m) => m.id === materialId)
  if (indice === -1) throw new NoEncontrado(`material ${materialId}`)
  return { material: capitulo.materiales[indice], indice, capitulo }
}

export async function marcarMaterialVisto(
  cursoId: string,
  capituloId: string,
  materialId: string,
): Promise<void> {
  const capitulo = capituloAccesible(cursoAsignado(cursoId), capituloId)
  if (!capitulo.materiales.some((m) => m.id === materialId)) {
    throw new NoEncontrado(`material ${materialId}`)
  }
  guardarVisto(cursoId, materialId)
}

export async function getTest(cursoId: string, capituloId: string | null): Promise<Test> {
  await simularLatencia()
  return testAccesible(cursoAsignado(cursoId), capituloId)
}

export interface ResultadoIntento {
  intento: Intento
  correccion: Correccion
}

/** Corrige y registra un intento terminado. */
export async function enviarIntento(
  cursoId: string,
  capituloId: string | null,
  intentoId: string,
  respuestas: IndiceRespuesta[],
): Promise<ResultadoIntento> {
  await simularLatencia()
  const test = testAccesible(cursoAsignado(cursoId), capituloId)
  const correccion = corregir(test, respuestas)
  const intento: Intento = {
    id: intentoId,
    testId: test.id,
    fecha: new Date().toISOString(),
    respuestas,
    aciertos: correccion.aciertos,
    total: correccion.total,
    porcentaje: correccion.porcentaje,
    superado: correccion.superado,
  }
  registrarIntento(cursoId, intento)
  return { intento, correccion }
}
