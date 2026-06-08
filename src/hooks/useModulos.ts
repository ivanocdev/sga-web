import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { fetchModulos, toggleModulo } from '@/services/modulosService'

export const MODULOS_QK = ['modulos']

export function useModulos() {
  return useQuery({
    queryKey: MODULOS_QK,
    queryFn: fetchModulos,
    // datos de módulos cambian poco — caché generosa para no re-fetching en cada navegación
    staleTime: 10 * 60_000,
  })
}

export function useToggleModulo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => toggleModulo(id, activo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MODULOS_QK })
    },
    onError: (err: Error) => {
      void Swal.fire({ icon: 'error', title: 'Error', text: err.message })
    },
  })
}
