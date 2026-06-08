import { supabase } from '@/lib/supabase'
import type { Categoria, CategoriaFormValues } from '@/types/categorias'

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, color')
    .order('nombre')
  if (error) throw error
  return data ?? []
}

export async function insertarCategoria(values: CategoriaFormValues): Promise<void> {
  const { error } = await supabase
    .from('categorias')
    .insert({ nombre: values.nombre, color: values.color || null, icono: '-' })
  if (error) throw error
}

export async function editarCategoria(id: number, values: CategoriaFormValues): Promise<void> {
  const { error } = await supabase
    .from('categorias')
    .update({ nombre: values.nombre, color: values.color || null })
    .eq('id', id)
  if (error) throw error
}

export async function eliminarCategoria(id: number): Promise<void> {
  const { error } = await supabase.from('categorias').delete().eq('id', id)
  if (error) throw error
}
