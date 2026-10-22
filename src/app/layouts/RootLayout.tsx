import { Outlet, ScrollRestoration } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

/** Columna móvil centrada (máx. 480 px) que envuelve todas las pantallas. */
export function RootLayout() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-background">
      <Outlet />
      <ScrollRestoration />
      <Toaster position="top-center" />
    </div>
  )
}
