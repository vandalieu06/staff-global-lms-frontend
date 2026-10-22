import { createLocalStore, isRecord } from '@/lib/local-store'
import { cerrarSesion as borrarSesion, getSesion, iniciarSesion, useSesion } from '@/lib/session-store'
import { cuentas as cuentasIniciales } from '@/mocks/usuarios'
import type { Usuario } from '@/types/domain'
import { ContrasenaActualIncorrecta, CredencialesInvalidas, NoAutenticado } from './errors'
import { simularLatencia } from './latency'

/**
 * Cambios hechos sobre las cuentas mock (contraseña nueva y primer acceso completado). Simulan
 * lo que guardaría el backend; se borran al reiniciar la demo.
 */
type CambiosCuenta = { password?: string; mustChangePassword?: boolean }
type CambiosGuardados = { v: 1; cuentas: Record<string, CambiosCuenta> }

export const cuentasStore = createLocalStore<CambiosGuardados>(
  'sgg-lms:v1:cuentas',
  () => ({ v: 1, cuentas: {} }),
  (value): value is CambiosGuardados => isRecord(value) && value.v === 1 && isRecord(value.cuentas),
)

function cuentaActual(usuarioId: string) {
  const base = cuentasIniciales.find((c) => c.usuario.id === usuarioId)
  if (!base) return undefined
  const cambios = cuentasStore.get().cuentas[usuarioId] ?? {}
  return {
    password: cambios.password ?? base.password,
    usuario: { ...base.usuario, mustChangePassword: cambios.mustChangePassword ?? base.usuario.mustChangePassword },
  }
}

function guardarCambios(usuarioId: string, cambios: CambiosCuenta) {
  cuentasStore.update((estado) => ({
    ...estado,
    cuentas: { ...estado.cuentas, [usuarioId]: { ...estado.cuentas[usuarioId], ...cambios } },
  }))
}

/** Usuario de la sesión actual, o `undefined` si no hay sesión (síncrono, para las guardas). */
export function usuarioActual(): Usuario | undefined {
  const sesion = getSesion()
  return sesion ? cuentaActual(sesion.usuarioId)?.usuario : undefined
}

/** Hook: usuario de la sesión, reactivo a inicio/cierre de sesión y a cambios de la cuenta. */
export function useUsuarioActual(): Usuario | undefined {
  const sesion = useSesion()
  cuentasStore.use()
  return sesion ? cuentaActual(sesion.usuarioId)?.usuario : undefined
}

export function requerirUsuario(): Usuario {
  const usuario = usuarioActual()
  if (!usuario) throw new NoAutenticado()
  return usuario
}

export async function login(email: string, password: string): Promise<Usuario> {
  await simularLatencia()
  const base = cuentasIniciales.find(
    (c) => c.usuario.email.toLowerCase() === email.trim().toLowerCase(),
  )
  const cuenta = base && cuentaActual(base.usuario.id)
  if (!cuenta || cuenta.password !== password) throw new CredencialesInvalidas()
  iniciarSesion(cuenta.usuario.id)
  return cuenta.usuario
}

/**
 * Cambia la contraseña. En el primer acceso no se pide la actual; desde Perfil sí
 * (`passwordActual`).
 */
export async function cambiarContrasena(nueva: string, passwordActual?: string): Promise<Usuario> {
  await simularLatencia()
  const usuario = requerirUsuario()
  const cuenta = cuentaActual(usuario.id)!
  if (!usuario.mustChangePassword && cuenta.password !== passwordActual) {
    throw new ContrasenaActualIncorrecta()
  }
  guardarCambios(usuario.id, { password: nueva, mustChangePassword: false })
  return { ...usuario, mustChangePassword: false }
}

export async function logout(): Promise<void> {
  borrarSesion()
}
