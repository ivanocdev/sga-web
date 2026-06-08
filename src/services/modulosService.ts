import { supabase } from '@/lib/supabase'

export interface Modulo {
  id: number
  nombre: string
  activo: boolean
  descripcion: string | null
  link: string
}

export async function fetchModulos(): Promise<Modulo[]> {
  const { data, error } = await supabase
    .from('modulos')
    .select('id, nombre, activo, descripcion, link')
    .order('id')
  if (error) throw error
  return data ?? []
}

export async function toggleModulo(id: number, activo: boolean): Promise<void> {
  const { error } = await supabase.from('modulos').update({ activo }).eq('id', id)
  if (error) throw error
}
