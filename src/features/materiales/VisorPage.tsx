import { CircleCheck, Download, Info } from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Bloqueado, getMaterial, marcarMaterialVisto, NoEncontrado } from '@/api'
import { AppHeader } from '@/components/AppHeader'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { StickyFooter } from '@/components/StickyFooter'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatoDuracion } from '@/lib/format'
import { useProgreso } from '@/lib/progress-store'
import { testDesbloqueado, testSuperado } from '@/lib/rules'
import { useAsync } from '@/lib/use-async'
import type { Capitulo, Material, ProgresoCurso } from '@/types/domain'
import { AudioPlayer } from './AudioPlayer'
import { nombreDescarga } from './download'
import { ImageViewer } from './ImageViewer'
import { VideoPlayer } from './VideoPlayer'

// pdf.js pesa: solo se descarga al abrir un PDF.
const PdfViewer = lazy(() => import('./PdfViewer').then((m) => ({ default: m.PdfViewer })))

/** 3.2–3.4 Visor de PDF, imagen, vídeo o audio (docs/pantallas.md §3.2–3.4). */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cursoId = '', capituloId = '', materialId = '' } = useParams()
  const progreso = useProgreso(cursoId)
  const datos = useAsync(() => getMaterial(cursoId, capituloId, materialId), [cursoId, capituloId, materialId])
  const capituloUrl = `/cursos/${cursoId}/capitulos/${capituloId}`

  const marcarVisto = useCallback(
    () => void marcarMaterialVisto(cursoId, capituloId, materialId),
    [cursoId, capituloId, materialId],
  )

  // PDF e imagen cuentan como vistos al abrirse; vídeo y audio, al terminar (decisiones.md §3).
  const tipo = datos.data?.material.tipo
  useEffect(() => {
    if (tipo === 'pdf' || tipo === 'imagen') marcarVisto()
  }, [tipo, marcarVisto])

  const bloqueado = datos.status === 'error' && datos.error instanceof Bloqueado
  useEffect(() => {
    if (!bloqueado) return
    toast.info(t('chapter.locked'))
    navigate(`/cursos/${cursoId}`, { replace: true })
  }, [bloqueado, cursoId, navigate, t])

  if (datos.status !== 'success') {
    return (
      <>
        <AppHeader variant="detail" title={t('screens.material')} to={capituloUrl} icon="close" />
        {datos.status === 'loading' || bloqueado ? (
          <LoadingState blocks={1} />
        ) : datos.error instanceof NoEncontrado ? (
          <ErrorState message={t('material.notFound')} />
        ) : (
          <ErrorState onRetry={datos.reload} />
        )}
      </>
    )
  }

  const { material, indice, capitulo } = datos.data
  const descarga = (
    <a
      href={material.url}
      download={nombreDescarga(material)}
      aria-label={t('chapter.download', { tipo: t(`material.typesLower.${material.tipo}`) })}
      className="flex size-11 items-center justify-center rounded-full text-foreground hover:bg-muted"
    >
      <Download className="size-[22px]" aria-hidden="true" />
    </a>
  )
  const multimedia = material.tipo === 'video' || material.tipo === 'audio'
  const visto = progreso.materialesVistos.includes(material.id)

  return (
    <div className="flex min-h-dvh flex-col bg-card pb-32">
      <AppHeader
        variant="detail"
        className="sticky top-0 z-20 border-b border-gray-100 bg-card"
        title={t('material.position', { n: indice + 1, total: capitulo.materiales.length })}
        to={capituloUrl}
        icon="close"
        actions={descarga}
      />

      {!multimedia && (
        <div className="px-5 pt-4 pb-3">
          <h1 className="text-lg leading-snug font-bold">{material.titulo}</h1>
          <p className="text-[13px] text-muted-foreground">{t(`material.types.${material.tipo}`)}</p>
        </div>
      )}

      {material.tipo === 'pdf' && (
        <Suspense fallback={<Skeleton className="mx-4 aspect-[1/1.414] rounded-sm" />}>
          <PdfViewer url={material.url} />
        </Suspense>
      )}
      {material.tipo === 'imagen' && <ImageViewer url={material.url} alt={material.titulo} />}
      {material.tipo === 'video' && <VideoPlayer url={material.url} onEnded={marcarVisto} />}

      {multimedia && (
        <main className="flex flex-col gap-4 px-5 pt-5">
          {material.tipo === 'video' && <Titulo material={material} />}
          {material.tipo === 'audio' && (
            <>
              <h1 className="sr-only">{material.titulo}</h1>
              <AudioPlayer url={material.url} titulo={material.titulo} onEnded={marcarVisto} />
              <Meta material={material} />
            </>
          )}
          {material.descripcion && (
            <p className="text-[15px] leading-relaxed text-gray-700">{material.descripcion}</p>
          )}
          {!visto && (
            <p className="flex items-start gap-2.5 rounded-[10px] bg-brand-50 px-3.5 py-3 text-sm leading-snug text-brand-800">
              <Info className="mt-px size-[18px] shrink-0" aria-hidden="true" />
              {t('material.markOnEnd')}
            </p>
          )}
        </main>
      )}

      <PieVisor capitulo={capitulo} material={material} progreso={progreso} capituloUrl={capituloUrl} />
    </div>
  )
}

function Titulo({ material }: { material: Material }) {
  return (
    <div>
      <h1 className="text-[21px] leading-tight font-bold tracking-tight">{material.titulo}</h1>
      <Meta material={material} />
    </div>
  )
}

function Meta({ material }: { material: Material }) {
  const { t } = useTranslation()
  return (
    <p className="mt-1.5 text-[13px] text-muted-foreground">
      {t(`material.types.${material.tipo}`)}
      {material.duracionSeg ? ` · ${t('material.duration', { duracion: formatoDuracion(material.duracionSeg) })}` : ''}
    </p>
  )
}

/**
 * Pie del visor: con todos los materiales vistos (y el test sin superar) lleva al test; si no,
 * al siguiente material pendiente (o al siguiente en orden).
 */
function PieVisor({
  capitulo,
  material,
  progreso,
  capituloUrl,
}: {
  capitulo: Capitulo
  material: Material
  progreso: ProgresoCurso
  capituloUrl: string
}) {
  const { t } = useTranslation()
  const listoParaTest = testDesbloqueado(capitulo, progreso) && !testSuperado(progreso, capitulo.test.id)
  const siguiente = siguienteMaterial(capitulo, material, progreso)

  return (
    <StickyFooter>
      {listoParaTest ? (
        <>
          <p
            role="status"
            className="flex items-start gap-2.5 rounded-[10px] bg-green-100 px-3.5 py-3 text-sm leading-snug text-green-900"
          >
            <CircleCheck className="mt-px size-[18px] shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">
                {t('material.allSeenTitle', { count: capitulo.materiales.length })}
              </strong>{' '}
              {t('material.allSeenBody')}
            </span>
          </p>
          <Button asChild size="touch">
            <Link to={`${capituloUrl}/test`}>{t('material.goToTest')}</Link>
          </Button>
        </>
      ) : siguiente ? (
        <Button asChild size="touch" variant="outline" className="border-brand-200 text-brand-800">
          <Link to={`${capituloUrl}/materiales/${siguiente.id}`}>{t('material.next')}</Link>
        </Button>
      ) : (
        <Button asChild size="touch" variant="outline">
          <Link to={capituloUrl}>{t('material.backToChapter')}</Link>
        </Button>
      )}
    </StickyFooter>
  )
}

function siguienteMaterial(capitulo: Capitulo, actual: Material, progreso: ProgresoCurso) {
  const { materiales } = capitulo
  const desde = materiales.findIndex((m) => m.id === actual.id)
  const enOrden = [...materiales.slice(desde + 1), ...materiales.slice(0, desde)]
  return enOrden.find((m) => !progreso.materialesVistos.includes(m.id)) ?? materiales[desde + 1]
}
