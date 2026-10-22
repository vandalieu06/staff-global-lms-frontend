import { createBrowserRouter, type RouteObject } from 'react-router'
import { RootLayout } from './layouts/RootLayout'
import { TabsLayout } from './layouts/TabsLayout'
import { NotFoundPage } from './NotFoundPage'

/**
 * Rutas del flujo del alumno (docs/pantallas.md). Cada pantalla se carga de forma perezosa y su
 * módulo exporta `Component`.
 */
export const routes: RouteObject[] = [
  {
    Component: RootLayout,
    children: [
      { path: 'login', lazy: () => import('@/features/auth/LoginPage') },
      { path: 'primer-acceso', lazy: () => import('@/features/auth/CambioContrasenaPage') },
      {
        Component: TabsLayout,
        children: [
          { index: true, lazy: () => import('@/features/cursos/MisCursosPage') },
          { path: 'perfil', lazy: () => import('@/features/perfil/PerfilPage') },
        ],
      },
      { path: 'perfil/contrasena', lazy: () => import('@/features/auth/CambioContrasenaPage') },
      {
        path: 'cursos/:cursoId',
        children: [
          { index: true, lazy: () => import('@/features/cursos/CursoPage') },
          { path: 'aprobado', lazy: () => import('@/features/test/CursoAprobadoPage') },
          {
            path: 'capitulos/:capituloId',
            children: [
              { index: true, lazy: () => import('@/features/materiales/CapituloPage') },
              {
                path: 'materiales/:materialId',
                lazy: () => import('@/features/materiales/VisorPage'),
              },
              {
                path: 'test',
                children: [
                  { index: true, lazy: () => import('@/features/test/TestInicioPage') },
                  { path: 'intento', lazy: () => import('@/features/test/TestIntentoPage') },
                  { path: 'resultado', lazy: () => import('@/features/test/TestResultadoPage') },
                ],
              },
            ],
          },
          {
            path: 'test-final',
            children: [
              { index: true, lazy: () => import('@/features/test/TestInicioPage') },
              { path: 'intento', lazy: () => import('@/features/test/TestIntentoPage') },
              { path: 'resultado', lazy: () => import('@/features/test/TestResultadoPage') },
            ],
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]

export const router = createBrowserRouter(routes)
