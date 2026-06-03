export interface Marca {
  id: number
  nombre: string
}

export interface RackRef {
  id: number
  codigo_rack: string
}

export interface CajaItem {
  id: number
  cantidad: number
}

// shape que devuelve el SELECT con joins
export interface ProductoRaw {
  id: number
  codigo: number
  nombre: string
  cantidad: number
  rack_ref: RackRef | null
  marcas: Marca | null
  piso: Array<{ cantidad: number }>
  cajas: CajaItem[]
  suelto: Array<{ id: number; cantidad: number }>
}

// totales calculados por el service (nunca llegan directo de la DB)
export interface Producto extends ProductoRaw {
  cantidad_piso: number
  cantidad_suelto: number
  tarimas: number
  total: number
}

// valores raw para pre-llenar el form al editar
// se obtiene con un SELECT separado (sin joins) para evitar el conflicto
// del campo "cajas" columna vs "cajas" tabla relacionada
export interface ProductoEditable {
  id: number
  codigo: number
  nombre: string
  marca_id: number | null
  cajas_por_tarima: number | null
  cantidad: number
}

// react-hook-form maneja todo como string hasta el submit
export interface ProductoFormValues {
  codigo: string
  nombre: string
  marca_id: string
  cajas_por_tarima: string
  cantidad: string
}

export interface FiltrosProductos {
  marca: string
}
