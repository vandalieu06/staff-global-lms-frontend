import { RadioGroupItem } from '@/components/ui/radio-group'

/**
 * Respuesta del test (DESIGN.md › Respuesta de test): tarjeta pulsable entera con radio de 22 px;
 * seleccionada, fondo `brand-50` y borde `primary` doble.
 */
export function AnswerOption({ id, value, texto }: { id: string; value: string; texto: string }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3.5 text-[15px] leading-normal text-foreground transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-brand-50 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
    >
      <RadioGroupItem
        id={id}
        value={value}
        className="mt-px size-[22px] border-2 border-gray-400 data-[state=checked]:border-primary data-[state=checked]:bg-card [&_[data-slot=radio-group-indicator]]:size-full [&_[data-slot=radio-group-indicator]_span]:size-2.5 [&_[data-slot=radio-group-indicator]_span]:bg-primary"
      />
      <span>{texto}</span>
    </label>
  )
}
