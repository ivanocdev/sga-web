import type { Marca } from './productos'

export type EstadoVenta = 'Normal' | 'Devolucion'

export interface UsuarioRef {
  id: number
  nombres: string
}

export interface Venta {
  id: number
  codigo: string
  cantidad_productos: number | null
  cantidad_total: number | null
  fecha: string | null
  factura_url: string | null
  estado: EstadoVenta
  marca_id: number | null
  usuario: string | null
  marcas: Marca | null
  usuarios: UsuarioRef | null
}

// datos mínimos del producto dentro del detalle de una venta
export interface ProductoDetalleRef {
  id: number
  codigo: number
  nombre: string
  marca_id: number | null
  racks: { id: number; codigo_rack: string } | null
}

export interface DetalleVenta {
  id: number
  venta_id: number
  producto_id: number
  cantidad: number
  fecha_caducidad: string | null
  ubicacion: string | null
  productos: ProductoDetalleRef | null
}

export interface AyudanteVenta {
  id: number
  venta_id: number
  usuario_id: number
  usuarios: UsuarioRef | null
}

// datos que saca el parser de facturas (PDF o Excel)
export interface FacturaParseada {
  pedidoNo: string | null
  fecha: string | null
  marca: string | null
  cantidadProductos: number | null
  cantidadTotal: number | null
  // lista de líneas de producto extraídas del archivo
  productos: FacturaProducto[]
}

export interface FacturaProducto {
  codigo: string
  nombre: string | null
  cantidad: number
  marca: string | null
}

// react-hook-form
export interface VentaFormValues {
  codigo: string
  marca_id: string
  cantidad_productos: string
  cantidad_total: string
  fecha: string
}

export type UploadType = 'pdf' | 'excel'

export interface FiltrosVentas {
  estado: EstadoVenta | ''
  marca: string
}
