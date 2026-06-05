import { supabase } from '@/lib/supabase'

export interface UsuarioBasico {
  id: string   // UUID
  nombre: string
  rol: string
}

export async function fetchUsuariosActivos(): Promise<UsuarioBasico[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, rol')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (error) throw error
  return (data ?? []) as UsuarioBasico[]
}
