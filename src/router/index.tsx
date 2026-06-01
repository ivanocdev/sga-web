import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense, type ComponentType } from 'react'
import MainLayout from '@/components/templates/MainLayout'

// Carga diferida por ruta — cada página genera su propio chunk, reduciendo el bundle inicial
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Almacen = lazy(() => import('@/pages/Almacen'))
const Racks = lazy(() => import('@/pages/Racks'))
const CajasProducto = lazy(() => import('@/pages/CajasProducto'))
const Ventas = lazy(() => import('@/pages/Ventas'))
const ProductosVenta = lazy(() => import('@/pages/ProductosVenta'))
const Usuarios = lazy(() => import('@/pages/Usuarios'))
const Categorias = lazy(() => import('@/pages/Categorias'))
const Configuracion = lazy(() => import('@/pages/Configuracion'))

function page(Page: ComponentType) {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Page />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: page(Login),
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: page(Dashboard) },
      { path: 'almacen', element: page(Almacen) },
      { path: 'almacen/racks', element: page(Racks) },
      { path: 'almacen/cajas/:productoId', element: page(CajasProducto) },
      { path: 'ventas', element: page(Ventas) },
      { path: 'ventas/:ventaId/productos', element: page(ProductosVenta) },
      { path: 'usuarios', element: page(Usuarios) },
      { path: 'categorias', element: page(Categorias) },
      { path: 'configuracion', element: page(Configuracion) },
    ],
  },
])
