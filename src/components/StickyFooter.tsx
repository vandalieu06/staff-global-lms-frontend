import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Barra de acción fija al pie (DESIGN.md › Barra de acción fija). La pantalla que la usa debe
 * dejar espacio inferior para que el contenido no quede tapado (`pb-28`).
 */
export function StickyFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-[480px] flex-col gap-2 border-t border-border bg-card px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
