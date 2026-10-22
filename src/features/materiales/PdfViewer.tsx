import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Worker de pdf.js servido por Vite desde node_modules (sin CDN).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const ZOOMS = [1, 1.5, 2] as const

/**
 * Visor de PDF (mockup 3.2): páginas en scroll al ancho de pantalla, paginador «3 / 12» que sigue
 * al scroll y zoom. Las capas de texto y anotaciones se desactivan (lectura, no edición).
 */
export function PdfViewer({ url, onError }: { url: string; onError?: () => void }) {
  const { t } = useTranslation()
  const contenedor = useRef<HTMLDivElement>(null)
  const paginas = useRef<(HTMLDivElement | null)[]>([])
  const [ancho, setAncho] = useState(0)
  const [total, setTotal] = useState(0)
  const [actual, setActual] = useState(1)
  const [zoom, setZoom] = useState(0)

  // Ancho disponible para las páginas.
  useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setAncho(Math.floor(entry.contentRect.width)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Página actual: la que ocupa el centro de la pantalla.
  useEffect(() => {
    if (!total) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActual(Number((entry.target as HTMLElement).dataset.pagina))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    paginas.current.forEach((p) => p && observer.observe(p))
    return () => observer.disconnect()
  }, [total, zoom])

  const irA = (n: number) => {
    const destino = Math.min(Math.max(n, 1), total)
    paginas.current[destino - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActual(destino)
  }

  return (
    <div className="flex flex-col">
      <div className="sticky top-14 z-10 flex h-14 items-center justify-between border-b border-border bg-card px-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon-touch" aria-label={t('material.pdf.prevPage')} disabled={actual <= 1} onClick={() => irA(actual - 1)}>
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span className="min-w-16 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {total ? t('material.pdf.page', { actual, total }) : '–'}
          </span>
          <Button variant="ghost" size="icon-touch" aria-label={t('material.pdf.nextPage')} disabled={!total || actual >= total} onClick={() => irA(actual + 1)}>
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-touch" aria-label={t('material.pdf.zoomOut')} disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)}>
            <Minus aria-hidden="true" />
          </Button>
          <span className="min-w-12 text-center text-[13px] text-muted-foreground tabular-nums">
            {ZOOMS[zoom] * 100} %
          </span>
          <Button variant="ghost" size="icon-touch" aria-label={t('material.pdf.zoomIn')} disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => z + 1)}>
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div ref={contenedor} className="overflow-x-auto bg-gray-200 px-4 py-4">
        <Document
          file={url}
          loading={<Skeleton className="aspect-[1/1.414] w-full rounded-sm" aria-label={t('material.pdf.loading')} />}
          error={<p className="p-4 text-[15px]">{t('material.pdf.error')}</p>}
          onLoadSuccess={({ numPages }) => setTotal(numPages)}
          onLoadError={onError}
          className="flex w-max min-w-full flex-col items-center gap-4"
        >
          {ancho > 0 &&
            Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                ref={(el) => {
                  paginas.current[i] = el
                }}
                data-pagina={i + 1}
                className="scroll-mt-32 overflow-hidden rounded-sm bg-white shadow-sm"
                aria-label={t('material.pdf.pageLabel', { n: i + 1 })}
              >
                <Page
                  pageNumber={i + 1}
                  width={(ancho - 32) * ZOOMS[zoom]}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
        </Document>
      </div>
    </div>
  )
}
