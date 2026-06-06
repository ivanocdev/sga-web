import { useQuery } from '@tanstack/react-query'
import {
  fetchVentasPorMarca,
  fetchRacksPorMarca,
  fetchCajasPorMarca,
  fetchProductosPorMarca,
  fetchProximosCaducar,
  fetchPedidosActivos,
  fetchMovimientosRecientes,
  fetchPedidosPorMes,
  fetchEntradasSemana,
} from '@/services/dashboardService'

// métricas históricas — no cambian tan seguido
const STALE_SLOW = 5 * 60 * 1000

// métricas operativas — cambian más seguido
const STALE_FAST = 60 * 1000

export function useVentasMarca() {
  return useQuery({
    queryKey: ['dashboard', 'ventas-marca'],
    queryFn: fetchVentasPorMarca,
    staleTime: STALE_SLOW,
  })
}

export function useRacksMarca() {
  return useQuery({
    queryKey: ['dashboard', 'racks-marca'],
    queryFn: fetchRacksPorMarca,
    staleTime: STALE_SLOW,
  })
}

export function useCajasMarca() {
  return useQuery({
    queryKey: ['dashboard', 'cajas-marca'],
    queryFn: fetchCajasPorMarca,
    staleTime: STALE_SLOW,
  })
}

export function useProductosMarca() {
  return useQuery({
    queryKey: ['dashboard', 'productos-marca'],
    queryFn: fetchProductosPorMarca,
    staleTime: STALE_SLOW,
  })
}

export function useProximosCaducar() {
  return useQuery({
    queryKey: ['dashboard', 'proximos-caducar'],
    queryFn: fetchProximosCaducar,
    staleTime: STALE_SLOW,
  })
}

export function usePedidosActivosDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'pedidos-activos'],
    queryFn: fetchPedidosActivos,
    staleTime: STALE_FAST,
  })
}

export function useMovimientosRecientes() {
  return useQuery({
    queryKey: ['dashboard', 'movimientos'],
    queryFn: fetchMovimientosRecientes,
    staleTime: 2 * 60 * 1000,
  })
}

export function usePedidosPorMes() {
  return useQuery({
    queryKey: ['dashboard', 'pedidos-mes'],
    queryFn: fetchPedidosPorMes,
    staleTime: STALE_SLOW,
  })
}

export function useEntradasSemana() {
  return useQuery({
    queryKey: ['dashboard', 'entradas-semana'],
    queryFn: fetchEntradasSemana,
    staleTime: 2 * 60 * 1000,
  })
}
