import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  fetchRacks,
  fetchRacksLibres,
  insertarRack,
  editarRack,
  eliminarRack,
} from '@/services/racksService'
import { useRacksStore } from '@/store/racksStore'
import type { RackFormValues } from '@/types/racks'

export function useRacksLibres(rack_id_actual?: number) {
  return useQuery({
    queryKey: ['racks-libres', rack_id_actual ?? null],
    queryFn: () => fetchRacksLibres(rack_id_actual),
    staleTime: 1000 * 30,
  })
}

export function useRacks() {
  const { busqueda } = useRacksStore()

  return useQuery({
    queryKey: ['racks', busqueda],
    queryFn: () => fetchRacks(busqueda),
    staleTime: 1000 * 30,
  })
}

export function useInsertarRack(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: insertarRack,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['racks'] })
      Swal.fire({ icon: 'success', title: '¡Rack creado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarRack(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: RackFormValues }) =>
      editarRack(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['racks'] })
      Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarRack() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: eliminarRack,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['racks'] })
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
