import type { Rol } from '@/types/auth'

export type { Usuario } from '@/types/auth'

export interface UsuarioRegistroValues {
  nombre: string
  correo: string
  password: string
  rol: Rol
}

export interface UsuarioEditValues {
  nombre: string
  rol: Rol
  activo: boolean
}
