import { z } from 'zod'

/** Requisitos de la contraseña nueva (docs/decisiones.md §2), en el orden en que se muestran. */
export const requisitos = [
  { id: 'length', labelKey: 'auth.password.reqLength', cumple: (nueva: string) => nueva.length >= 8 },
  {
    id: 'mix',
    labelKey: 'auth.password.reqMix',
    cumple: (nueva: string) => /[A-ZÁÉÍÓÚÑ]/.test(nueva) && /\d/.test(nueva),
  },
  {
    id: 'match',
    labelKey: 'auth.password.reqMatch',
    cumple: (nueva: string, repetida: string) => nueva.length > 0 && nueva === repetida,
  },
] as const

export function cumpleRequisitos(nueva: string, repetida: string) {
  return requisitos.every((r) => r.cumple(nueva, repetida))
}

/** Formulario de nueva contraseña. `actual` solo se exige al cambiarla desde Perfil. */
export function passwordSchema(conActual: boolean, mensajeActual: string) {
  return z
    .object({
      actual: conActual ? z.string().min(1, mensajeActual) : z.string().optional(),
      nueva: z.string(),
      repetida: z.string(),
    })
    .refine((v) => cumpleRequisitos(v.nueva, v.repetida), { path: ['repetida'] })
}

export type PasswordForm = z.infer<ReturnType<typeof passwordSchema>>
