import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Fix del Bug 6 del proyecto original: useMemo estabiliza el array de tablas
// para que el useEffect no re-ejecute en cada render
export function useRealtimeDashboard() {
  const qc = useQueryClient()
  const tablas = useMemo(() => ['ventas', 'cajas', 'racks'] as const, [])

  useEffect(() => {
    const channel = supabase.channel('dashboard-realtime')

    tablas.forEach(tabla => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabla },
        () => {
          // invalida todo el dashboard — las queries se refrescan individualmente
          void qc.invalidateQueries({ queryKey: ['dashboard'] })
        }
      )
    })

    channel.subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [tablas, qc])
}
