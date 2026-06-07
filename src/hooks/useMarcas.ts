import { useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { insertarMarca, editarMarca, eliminarMarca } from '@/services/marcasService'

// la query de lectura ['marcas'] vive en useProductos — aquí solo mutaciones
const QK = ['marcas']

export function useInsertarMarca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (nombre: string) => insertarMarca(nombre),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: '¡Marca agregada!', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarMarca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, nombre }: { id: number; nombre: string }) => editarMarca(id, nombre),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarMarca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarMarca(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: 'Marca eliminada', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
