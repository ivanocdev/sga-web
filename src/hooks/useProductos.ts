import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import {
  fetchProductos,
  insertarProducto,
  editarProducto,
  eliminarProducto,
} from '@/services/productosService'
import { fetchMarcas } from '@/services/marcasService'
import { useProductosStore } from '@/store/productosStore'
import type { ProductoFormValues } from '@/types/productos'

export function useProductos() {
  const { busqueda, filtros } = useProductosStore()

  return useQuery({
    queryKey: ['productos', busqueda, filtros],
    queryFn: () => fetchProductos(filtros, busqueda),
    staleTime: 1000 * 30,
  })
}

export function useMarcas() {
  return useQuery({
    queryKey: ['marcas'],
    queryFn: fetchMarcas,
    staleTime: 1000 * 60 * 5,
  })
}

export function useInsertarProducto(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: insertarProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      Swal.fire({ icon: 'success', title: '¡Producto creado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarProducto(onSuccess?: () => void) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: number; values: ProductoFormValues }) =>
      editarProducto(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1500, showConfirmButton: false })
      onSuccess?.()
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
    },
    onError: (err: Error) => {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
