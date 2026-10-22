import type { Material, MaterialTipo } from '@/types/domain'
import { FileText, Headphones, Image, Video, type LucideIcon } from 'lucide-react'

/** Icono de cada tipo de material (Lucide, como el resto de la app). */
export const iconoMaterial: Record<MaterialTipo, LucideIcon> = {
  pdf: FileText,
  imagen: Image,
  video: Video,
  audio: Headphones,
}

/** Nombre legible para el archivo descargado: «Prevención de riesgos en el stand.pdf». */
export function nombreDescarga(material: Material): string {
  const extension = material.url.split('.').pop() ?? ''
  const titulo = material.titulo.replace(/[\\/:*?"<>|]/g, '').trim()
  return extension ? `${titulo}.${extension}` : titulo
}
