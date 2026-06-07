import { supabase } from '@/lib/supabase'
import type { Usuario } from '@/types/auth'
import type { UsuarioEditValues } from '@/types/usuarios'

export interface UsuarioBasico {
  id: string
  nombre: string
  rol: string
}

// lista reducida para selects/asignaciones (solo activos)
export async function fetchUsuariosActivos(): Promise<UsuarioBasico[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, rol')
    .eq('activo', true)
    .order('nombre', { ascending: true })
  if (error) throw error
  return (data ?? []) as UsuarioBasico[]
}

// lista completa para el módulo de administración
export async function fetchTodosUsuarios(): Promise<Usuario[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, rol, activo')
    .order('nombre')
  if (error) throw error
  return (data ?? []) as Usuario[]
}

export async function editarUsuario(id: string, values: UsuarioEditValues): Promise<void> {
  const { error } = await supabase.from('usuarios').update(values).eq('id', id)
  if (error) throw error
}

export async function eliminarUsuario(id: string): Promise<void> {
  const { error } = await supabase.from('usuarios').delete().eq('id', id)
  if (error) throw error
}
