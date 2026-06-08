import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  fetchCategorias,
  insertarCategoria,
  editarCategoria,
  eliminarCategoria,
} from '@/services/categoriasService'
import type { CategoriaFormValues } from '@/types/categorias'

const QK = ['categorias']

export function useCategorias() {
  return useQuery({
    queryKey: QK,
    queryFn: fetchCategorias,
    staleTime: 5 * 60_000,
  })
}

export function useInsertarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: CategoriaFormValues) => insertarCategoria(values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: '¡Categoría agregada!', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: CategoriaFormValues }) =>
      editarCategoria(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK })
      void Swal.fire({ icon: 'success', title: 'Categoría eliminada', timer: 1600, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
