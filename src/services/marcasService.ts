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

export async function insertarMarca(nombre: string): Promise<void> {
  const { error } = await supabase.from('marcas').insert({ nombre })
  if (error) throw error
}

export async function editarMarca(id: number, nombre: string): Promise<void> {
  const { error } = await supabase.from('marcas').update({ nombre }).eq('id', id)
  if (error) throw error
}

export async function eliminarMarca(id: number): Promise<void> {
  const { error } = await supabase.from('marcas').delete().eq('id', id)
  if (error) throw error
}
