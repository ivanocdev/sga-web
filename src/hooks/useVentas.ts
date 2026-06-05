import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  fetchVentas,
  fetchDetalleVenta,
  fetchAyudantesVenta,
  fetchEquipoVenta,
  insertarVenta,
  editarVenta,
  eliminarVenta,
  insertarDevolucion,
  asignarEquipo,
  eliminarDetalleVenta,
} from '@/services/ventasService'
import { useVentasStore } from '@/store/ventasStore'
import type { VentaFormValues } from '@/types/ventas'

export function useVentas() {
  const { filtros } = useVentasStore()

  return useQuery({
    queryKey: ['ventas', filtros],
    queryFn: () => fetchVentas(filtros),
    staleTime: 1000 * 30,
  })
}

export function useDetalleVenta(ventaId: number) {
  return useQuery({
    queryKey: ['detalle-venta', ventaId],
    queryFn: () => fetchDetalleVenta(ventaId),
    enabled: ventaId > 0,
    staleTime: 1000 * 30,
  })
}

export function useAyudantesVenta(ventaId: number) {
  return useQuery({
    queryKey: ['ayudantes-venta', ventaId],
    queryFn: () => fetchAyudantesVenta(ventaId),
    enabled: ventaId > 0,
    staleTime: 1000 * 30,
  })
}

export function useEquipoVenta(ventaId: number) {
  return useQuery({
    queryKey: ['equipo-venta', ventaId],
    queryFn: () => fetchEquipoVenta(ventaId),
    enabled: ventaId > 0,
    staleTime: 1000 * 30,
  })
}

export function useInsertarVenta(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ values, facturaPath }: { values: VentaFormValues; facturaPath: string | null }) =>
      insertarVenta(values, facturaPath),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] })
      Swal.fire({ icon: 'success', title: '¡Venta registrada!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarVenta(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: VentaFormValues }) =>
      editarVenta(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] })
      Swal.fire({ icon: 'success', title: '¡Actualizada!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarVenta() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: eliminarVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] })
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useInsertarDevolucion(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ values, facturaPath }: { values: VentaFormValues; facturaPath: string | null }) =>
      insertarDevolucion(values, facturaPath),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] })
      Swal.fire({ icon: 'success', title: '¡Devolución registrada!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useAsignarEquipo(ventaId: number, onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      responsableAuthId,
      ayudantesIds,
    }: {
      responsableAuthId: string
      ayudantesIds: string[]
    }) => asignarEquipo(ventaId, responsableAuthId, ayudantesIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas'] })
      qc.invalidateQueries({ queryKey: ['equipo-venta', ventaId] })
      qc.invalidateQueries({ queryKey: ['ayudantes-venta', ventaId] })
      Swal.fire({ icon: 'success', title: '¡Equipo asignado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarDetalleVenta(ventaId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: eliminarDetalleVenta,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['detalle-venta', ventaId] })
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
