export type TipoRegistro = 'caja' | 'suelto' | 'piso'

// registro unificado de las 3 tablas (cajas, suelto, piso)
// el service agrega 'tipo' y 'ubicacion' al mergear los resultados
export interface RegistroCaja {
  id: number
  producto_id: number
  cantidad: number
  fecha_caducidad: string | null
  codigo_barras: string | null
  fecha_entrada: string | null
  rack_id: number | null
  tipo: TipoRegistro
  ubicacion: string
}

// react-hook-form maneja todo como string hasta el submit
export interface RegistroCajaFormValues {
  cantidad: string
  fecha_caducidad: string
  rack_id: string
  codigo_barras: string
}
