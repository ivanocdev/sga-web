export type Rol = 'admin' | 'operador'

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
  activo: boolean
}
