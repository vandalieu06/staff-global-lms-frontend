/** Visor de imagen: ajustada al ancho; el zoom es el gesto nativo de pellizcar. */
export function ImageViewer({ url, alt }: { url: string; alt: string }) {
  return (
    <div className="bg-gray-200 p-4">
      <img src={url} alt={alt} className="mx-auto h-auto w-full rounded-sm bg-white shadow-sm" />
    </div>
  )
}
