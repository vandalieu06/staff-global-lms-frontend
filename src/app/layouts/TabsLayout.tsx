import { Outlet } from 'react-router'
import { BottomNav } from '@/components/BottomNav'

/** Pantallas raíz con barra inferior (Mis cursos y Perfil). */
export function TabsLayout() {
  return (
    <>
      <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
        <Outlet />
      </div>
      <BottomNav />
    </>
  )
}
