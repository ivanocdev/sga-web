import { Navigate, Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '@/context/AuthContext'

// rutas que requieren sesión activa
export function ProtectedRoute() {
  const { session, loading } = useAuth()

  // esperamos a resolver la sesión inicial antes de redirigir — evita flash de /login
  if (loading) return <Centrado>Cargando...</Centrado>
  if (!session) return <Navigate to="/login" replace />

  return <Outlet />
}

// rutas solo para usuarios sin sesión (si ya hay sesión, volvemos al dashboard)
export function PublicRoute() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (session) return <Navigate to="/" replace />

  return <Outlet />
}

// rutas exclusivas para administradores — ya sabemos que hay sesión porque está dentro de ProtectedRoute
export function AdminRoute() {
  const { usuario } = useAuth()

  if (usuario?.rol !== 'admin') return <Navigate to="/" replace />

  return <Outlet />
}

const Centrado = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  color: #666;
`
