import { supabase } from '@/lib/supabase'
import type { Marca } from '@/types/productos'

export async function fetchMarcas(): Promise<Marca[]> {
  const { data, error } = await supabase
    .from('marcas')
    .select('id, nombre')
    .order('nombre')
  if (error) throw error
  return data ?? []
}
