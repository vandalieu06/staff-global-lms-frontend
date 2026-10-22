import type { Usuario } from '@/types/domain'

/** Cuenta mock con la contraseña provisional de la invitación. */
export interface CuentaMock {
  usuario: Usuario
  password: string
}

export const cuentas: CuentaMock[] = [
  {
    usuario: {
      id: 'u-lucia',
      nombre: 'Lucía',
      apellidos: 'Fernández',
      email: 'lucia.fernandez@email.com',
      idioma: 'es',
      mustChangePassword: true,
      cursosAsignados: ['dermoconsejera'],
    },
    password: 'provisional',
  },
]
