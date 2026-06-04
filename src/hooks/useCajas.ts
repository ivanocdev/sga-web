import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  fetchRegistrosPorProducto,
  insertarRegistro,
  editarRegistro,
  eliminarRegistro,
} from '@/services/cajasService'
import type { RegistroCaja, RegistroCajaFormValues, TipoRegistro } from '@/types/cajas'

export function useRegistrosCaja(productoId: number) {
  return useQuery({
    queryKey: ['cajas', productoId],
    queryFn: () => fetchRegistrosPorProducto(productoId),
    enabled: productoId > 0,
    staleTime: 1000 * 30,
  })
}

export function useInsertarRegistroCaja(productoId: number, onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ values, tipo }: { values: RegistroCajaFormValues; tipo: TipoRegistro }) =>
      insertarRegistro(values, productoId, tipo),
    onSuccess: () => {
      // invalidar cajas, totales de producto y estado de racks
      qc.invalidateQueries({ queryKey: ['cajas', productoId] })
      qc.invalidateQueries({ queryKey: ['productos'] })
      qc.invalidateQueries({ queryKey: ['racks'] })
      Swal.fire({ icon: 'success', title: '¡Registrado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarRegistroCaja(productoId: number, onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ values, registro }: { values: RegistroCajaFormValues; registro: RegistroCaja }) =>
      editarRegistro(values, registro),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cajas', productoId] })
      qc.invalidateQueries({ queryKey: ['productos'] })
      qc.invalidateQueries({ queryKey: ['racks'] })
      Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarRegistroCaja(productoId: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: eliminarRegistro,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cajas', productoId] })
      qc.invalidateQueries({ queryKey: ['productos'] })
      qc.invalidateQueries({ queryKey: ['racks'] })
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
