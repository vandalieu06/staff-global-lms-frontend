import { Navigate, Outlet, useLocation } from 'react-router'
import { useUsuarioActual } from '@/api'

const PRIMER_ACCESO = '/primer-acceso'

/**
 * Guarda de las rutas privadas: sin sesión → `/login`; con la contraseña provisional → solo
 * `/primer-acceso`; con la contraseña ya cambiada, `/primer-acceso` lleva a Mis cursos.
 */
export function RequireSession() {
  const usuario = useUsuarioActual()
  const { pathname } = useLocation()

  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.mustChangePassword && pathname !== PRIMER_ACCESO) {
    return <Navigate to={PRIMER_ACCESO} replace />
  }
  if (!usuario.mustChangePassword && pathname === PRIMER_ACCESO) return <Navigate to="/" replace />
  return <Outlet />
}
