export interface ProductoEnRack {
  id: number
  nombre: string
  codigo: number
}

// shape que devuelve el service con joins (marcas + productos via cajas)
export interface Rack {
  id: number
  codigo_rack: string
  nivel: string
  posicion: string
  lado: string
  marca_id: number | null
  marcas: { id: number; nombre: string } | null
  ocupado: boolean
  productos_info: ProductoEnRack[]
}

// react-hook-form maneja todo como string hasta el submit
export interface RackFormValues {
  codigo_rack: string
  nivel: string
  posicion: string
  lado: string
  marca_id: string
}

export interface FiltrosRacks {
  busqueda: string
}
