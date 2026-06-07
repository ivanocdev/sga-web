import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { fetchTodosUsuarios, editarUsuario, eliminarUsuario } from '@/services/usuariosService'
import type { UsuarioEditValues } from '@/types/usuarios'

export const USUARIOS_QK = ['usuarios']

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_QK,
    queryFn: fetchTodosUsuarios,
    staleTime: 5 * 60_000,
  })
}

export function useEliminarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eliminarUsuario(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_QK })
      void Swal.fire({ icon: 'success', title: 'Usuario eliminado', timer: 1800, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}

export function useEditarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UsuarioEditValues }) =>
      editarUsuario(id, values),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_QK })
      void Swal.fire({ icon: 'success', title: '¡Actualizado!', timer: 1800, showConfirmButton: false })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
