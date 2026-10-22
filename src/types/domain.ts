/** Modelo de dominio del LMS (docs/brief.md › Cómo se organiza el contenido). */

export type MaterialTipo = 'pdf' | 'imagen' | 'video' | 'audio'

export interface Material {
  id: string
  tipo: MaterialTipo
  titulo: string
  descripcion?: string
  /** Ruta pública del archivo (previsualización y descarga). */
  url: string
  tamanoBytes: number
  /** Vídeo y audio. */
  duracionSeg?: number
  /** PDF. */
  paginas?: number
}

export type IndiceRespuesta = 0 | 1 | 2 | 3

export interface Pregunta {
  id: string
  enunciado: string
  respuestas: readonly [string, string, string, string]
  correcta: IndiceRespuesta
  explicacion: string
}

export interface Test {
  id: string
  preguntas: Pregunta[]
  /** Nota mínima para superarlo, en %. */
  notaMinima: number
}

export interface Capitulo {
  id: string
  orden: number
  titulo: string
  descripcion?: string
  materiales: Material[]
  test: Test
  /** Capítulo anunciado en el temario cuyo contenido aún no se ha publicado. */
  contenidoPendiente: boolean
}

export interface Formacion {
  id: string
  nombre: string
}

export interface Curso {
  id: string
  formacion: Formacion
  titulo: string
  descripcion: string
  capitulos: Capitulo[]
  testFinal: Test
}

export interface Usuario {
  id: string
  nombre: string
  apellidos: string
  email: string
  idioma: 'es'
  /** Primer acceso con contraseña provisional: debe cambiarla antes de entrar. */
  mustChangePassword: boolean
  /** Cursos asignados por Staff. */
  cursosAsignados: string[]
}

export interface Intento {
  id: string
  testId: string
  /** ISO 8601. */
  fecha: string
  /** Índice elegido (sobre el orden original de las respuestas) por cada pregunta. */
  respuestas: IndiceRespuesta[]
  aciertos: number
  total: number
  /** Entero 0–100. */
  porcentaje: number
  superado: boolean
}

export interface ProgresoCurso {
  materialesVistos: string[]
  /** Intentos por id de test, del más antiguo al más reciente. */
  intentos: Record<string, Intento[]>
}

export type EstadoCapitulo = 'bloqueado' | 'en-curso' | 'superado'
export type EstadoTestFinal = 'bloqueado' | 'disponible' | 'superado'
