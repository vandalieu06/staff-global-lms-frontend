import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useBlocker, useNavigate } from 'react-router'
import { enviarIntento } from '@/api'
import { ErrorState, LoadingState } from '@/components/LoadState'
import { StickyFooter } from '@/components/StickyFooter'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'
import { ordenRespuestas } from '@/lib/shuffle'
import type { IndiceRespuesta } from '@/types/domain'
import { AnswerOption } from './AnswerOption'
import { QuestionStepper } from './QuestionStepper'
import { useIntento } from './useIntento'
import { useDatosTest } from './useTestScope'

/**
 * 4.2 Test · pregunta (docs/pantallas.md §4.2). Una pregunta cada vez y sin volver atrás: salir
 * (con la X o con el botón atrás del navegador) pide confirmación y descarta el intento.
 */
export function Component() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cursoId, capituloId, isFinal, base, exitTo, datos, bloqueado, test, contexto } = useDatosTest()
  const { intento, elegir, avanzar, descartar } = useIntento(cursoId, test?.id)
  const [enviando, setEnviando] = useState(false)
  const enviandoRef = useRef(false)
  const legend = useRef<HTMLLegendElement>(null)

  // Cualquier navegación fuera del intento (X, atrás, enlaces) se confirma antes.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !enviandoRef.current && intento !== null && currentLocation.pathname !== nextLocation.pathname,
  )

  // Al cambiar de pregunta, el foco va al enunciado (lectores de pantalla y teclado).
  const indice = intento?.indice
  useEffect(() => {
    if (indice !== undefined && indice > 0) legend.current?.focus()
  }, [indice])

  if (!test) {
    return datos.status === 'loading' || bloqueado ? <LoadingState /> : <ErrorState onRetry={datos.reload} />
  }
  if (!intento || intento.indice >= test.preguntas.length) return <Navigate to={base} replace />

  const total = test.preguntas.length
  const pregunta = test.preguntas[intento.indice]
  const elegida = intento.respuestas[intento.indice]
  const ultima = intento.indice === total - 1
  const orden = ordenRespuestas(intento.id, pregunta.id)

  const continuar = async () => {
    if (elegida === null) return
    if (!ultima) {
      avanzar()
      window.scrollTo({ top: 0 })
      return
    }
    enviandoRef.current = true
    setEnviando(true)
    const respuestas = intento.respuestas as IndiceRespuesta[]
    const { correccion } = await enviarIntento(cursoId, capituloId, intento.id, respuestas)
    descartar()
    navigate(isFinal && correccion.superado ? `/cursos/${cursoId}/aprobado` : `${base}/resultado`, {
      replace: true,
    })
  }

  return (
    <div className="pb-28">
      <header className="flex flex-col gap-1.5 px-2 pt-1.5">
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon-touch">
            <Link to={exitTo} aria-label={t('test.exit')}>
              <X aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="flex-1 text-[15px] font-semibold">{t('test.question', { n: intento.indice + 1, total })}</h1>
          <span className="pr-3 text-[13px] text-muted-foreground">{contexto}</span>
        </div>
        <QuestionStepper actual={intento.indice + 1} total={total} />
      </header>

      <main className="px-5 pt-6">
        <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          <legend
            ref={legend}
            id={`enunciado-${pregunta.id}`}
            tabIndex={-1}
            className="mb-[18px] p-0 text-[19px] leading-[1.4] font-bold tracking-tight outline-none"
          >
            {pregunta.enunciado}
          </legend>
          <RadioGroup
            key={pregunta.id}
            value={elegida === null ? '' : String(elegida)}
            onValueChange={(v) => elegir(Number(v) as IndiceRespuesta)}
            className="gap-3"
            aria-labelledby={`enunciado-${pregunta.id}`}
          >
            {orden.map((original) => (
              <AnswerOption
                key={original}
                id={`${pregunta.id}-r${original}`}
                value={String(original)}
                texto={pregunta.respuestas[original]}
              />
            ))}
          </RadioGroup>
        </fieldset>
      </main>

      <StickyFooter>
        <Button size="touch" disabled={elegida === null || enviando} onClick={() => void continuar()}>
          {enviando ? t('test.sending') : ultima ? t('test.finish') : t('test.next')}
        </Button>
      </StickyFooter>

      <AlertDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(abierto) => !abierto && blocker.state === 'blocked' && blocker.reset()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('test.exitTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('test.exitBody')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">{t('test.exitCancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-11"
              onClick={() => {
                descartar()
                if (blocker.state === 'blocked') blocker.proceed()
              }}
            >
              {t('test.exitConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
