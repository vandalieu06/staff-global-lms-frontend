import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { aplicarPreset, presetsDemo, reiniciarDemo } from '@/api'
import { Button } from '@/components/ui/button'

/** El panel de demo se muestra salvo que `VITE_DEMO` sea `"false"` (spec 03). */
export const demoActiva = import.meta.env.VITE_DEMO !== 'false'

/** Herramientas del prototipo para saltar a cualquier estado sin recorrer el flujo. */
export function DemoPanel() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section
      aria-labelledby="demo-titulo"
      className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 p-4"
    >
      <div>
        <h2 id="demo-titulo" className="text-sm font-semibold text-gray-700">
          {t('demo.title')}
        </h2>
        <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{t('demo.body')}</p>
      </div>
      <div className="flex flex-col gap-2">
        {presetsDemo.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className="h-11 justify-start rounded-[10px] px-3.5 text-sm"
            onClick={() => {
              aplicarPreset(preset.id)
              toast.success(t('demo.applied', { nombre: t(preset.labelKey) }))
            }}
          >
            {t(preset.labelKey)}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="h-11 justify-start rounded-[10px] px-3.5 text-sm text-muted-foreground"
          onClick={() => {
            reiniciarDemo()
            navigate('/login', { replace: true })
          }}
        >
          <RotateCcw aria-hidden="true" />
          {t('demo.reset')}
        </Button>
      </div>
    </section>
  )
}
