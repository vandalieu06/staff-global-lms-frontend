export { cn } from "cn"

/** Iniciales para el avatar: «Lucía Fernández» → «LF». */
export function iniciales(nombre: string, apellidos: string) {
  return `${nombre.trim().charAt(0)}${apellidos.trim().charAt(0)}`.toUpperCase()
}
