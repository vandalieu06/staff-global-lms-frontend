/** Errores tipados de la capa de datos. Las pantallas los distinguen con `instanceof`. */

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

/** Email o contraseña incorrectos. */
export class CredencialesInvalidas extends ApiError {
  constructor() {
    super('Email o contraseña incorrectos')
  }
}

/** No hay sesión iniciada. */
export class NoAutenticado extends ApiError {
  constructor() {
    super('No hay sesión iniciada')
  }
}

/** El recurso no existe o no está asignado al alumno. */
export class NoEncontrado extends ApiError {
  constructor(recurso: string) {
    super(`No encontrado: ${recurso}`)
  }
}

/** El recurso existe pero aún no está desbloqueado para el alumno. */
export class Bloqueado extends ApiError {
  constructor(recurso: string) {
    super(`Bloqueado: ${recurso}`)
  }
}

/** La contraseña actual no coincide (cambio desde Perfil). */
export class ContrasenaActualIncorrecta extends ApiError {
  constructor() {
    super('La contraseña actual no es correcta')
  }
}
