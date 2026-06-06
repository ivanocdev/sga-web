export interface VentasMarca {
  nombre: string
  cantidad: number
}

export interface RacksMarca {
  nombre: string
  total: number
  ocupados: number
}

export interface CajasMarca {
  nombre: string
  cantidad: number
}

export interface ProductosMarca {
  nombre: string
  cantidad: number
}

export interface ProductoCaducar {
  codigo_barras: string
  marca: string
  dias: number
  tipo: 'caja' | 'suelto' | 'piso'
}

export interface PedidoActivo {
  codigo: string
  marca: string
  estado: string
  fecha: string | null
}

export interface MovimientoReciente {
  pedido: string
  cantidad: string
  marca: string
  dia: string
  tipo: 'entrada' | 'salida'
}

export interface PedidoMes {
  mes: string
  cantidad: number
}

export interface EntradaSemana {
  nombre: string
  cantidad: number
  porcentaje: string
}

export interface EntradasSemanaData {
  data: EntradaSemana[]
  total: number
}
