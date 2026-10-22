import { createLocalStore, isRecord } from './local-store'

export interface Sesion {
  usuarioId: string
}

type SesionGuardada = { v: 1; sesion: Sesion | null }

/** Sesión del alumno (mock). La autenticación real llegará con el backend. */
export const sessionStore = createLocalStore<SesionGuardada>(
  'sgg-lms:v1:sesion',
  () => ({ v: 1, sesion: null }),
  (value): value is SesionGuardada =>
    isRecord(value) &&
    value.v === 1 &&
    (value.sesion === null || (isRecord(value.sesion) && typeof value.sesion.usuarioId === 'string')),
)

export const getSesion = () => sessionStore.get().sesion
export const iniciarSesion = (usuarioId: string) => sessionStore.set({ v: 1, sesion: { usuarioId } })
export const cerrarSesion = () => sessionStore.set({ v: 1, sesion: null })
export const useSesion = () => sessionStore.use().sesion
