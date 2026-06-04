import { supabase } from '@/lib/supabase'
import type {
  Venta,
  DetalleVenta,
  AyudanteVenta,
  VentaFormValues,
  FacturaProducto,
  FiltrosVentas,
  EstadoVenta,
} from '@/types/ventas'

const TABLA = 'ventas'
const TABLA_DETALLE = 'detalle_ventas'
const TABLA_AYUDANTES = 'ayudantes_venta'

const SELECT_LISTA = `
  id, codigo, cantidad_productos, cantidad_total, fecha,
  factura_url, estado, marca_id, usuario,
  marcas(id, nombre),
  usuarios(id, nombres)
`.trim()

export async function fetchVentas(filtros?: Partial<FiltrosVentas>): Promise<Venta[]> {
  let query = supabase.from(TABLA).select(SELECT_LISTA)

  if (filtros?.estado) {
    query = query.eq('estado', filtros.estado)
  }

  if (filtros?.marca) {
    query = query.eq('marca_id', filtros.marca)
  }

  const { data, error } = await query.order('fecha', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Venta[]
}

export async function fetchDetalleVenta(ventaId: number): Promise<DetalleVenta[]> {
  const { data, error } = await supabase
    .from(TABLA_DETALLE)
    .select(`
      id, venta_id, producto_id, cantidad, fecha_caducidad, ubicacion,
      productos:producto_id(id, codigo, nombre, marca_id, racks(id, codigo_rack))
    `)
    .eq('venta_id', ventaId)

  if (error) throw error
  return (data ?? []) as unknown as DetalleVenta[]
}

export async function fetchAyudantesVenta(ventaId: number): Promise<AyudanteVenta[]> {
  const { data, error } = await supabase
    .from(TABLA_AYUDANTES)
    .select('id, venta_id, usuario_id, usuarios(id, nombres)')
    .eq('venta_id', ventaId)

  if (error) throw error
  return (data ?? []) as unknown as AyudanteVenta[]
}

export async function fetchEquipoVenta(ventaId: number) {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id, usuario, estado, usuarios(id, nombres)')
    .eq('id', ventaId)
    .single()

  if (error) throw error
  return data as unknown as {
    id: number
    usuario: string | null
    estado: EstadoVenta
    usuarios: { id: number; nombres: string } | null
  }
}

// sube el archivo al bucket 'facturas' (privado)
// devuelve la ruta relativa, no la URL pública — el bucket es privado
export async function uploadFactura(archivo: File): Promise<string> {
  const nombre = archivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${Date.now()}_${nombre}`

  const { error } = await supabase.storage
    .from('facturas')
    .upload(filePath, archivo)

  if (error) throw error
  return filePath
}

// genera una URL firmada temporal para previsualizar/descargar la factura
export async function getUrlFactura(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('facturas')
    .createSignedUrl(filePath, 60 * 60) // 1 hora

  if (error) throw error
  return data.signedUrl
}

export async function insertarVenta(
  values: VentaFormValues,
  facturaPath: string | null
): Promise<number> {
  // verificar código duplicado antes de insertar
  const { data: existente, error: errVerificacion } = await supabase
    .from(TABLA)
    .select('id')
    .eq('codigo', values.codigo.trim())
    .maybeSingle()

  if (errVerificacion) throw errVerificacion

  if (existente) {
    throw new Error('Ya existe un pedido con ese código.')
  }

  const { data, error } = await supabase
    .from(TABLA)
    .insert({
      codigo: values.codigo.trim(),
      marca_id: values.marca_id ? Number(values.marca_id) : null,
      cantidad_productos: values.cantidad_productos ? Number(values.cantidad_productos) : null,
      cantidad_total: values.cantidad_total ? Number(values.cantidad_total) : null,
      fecha: values.fecha || null,
      factura_url: facturaPath,
      estado: 'Normal' satisfies EstadoVenta,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export async function editarVenta(id: number, values: VentaFormValues): Promise<void> {
  const { error } = await supabase
    .from(TABLA)
    .update({
      codigo: values.codigo.trim(),
      marca_id: values.marca_id ? Number(values.marca_id) : null,
      cantidad_productos: values.cantidad_productos ? Number(values.cantidad_productos) : null,
      cantidad_total: values.cantidad_total ? Number(values.cantidad_total) : null,
      fecha: values.fecha || null,
    })
    .eq('id', id)

  if (error) throw error
}

export async function eliminarVenta(id: number): Promise<void> {
  // obtener la ruta de la factura antes de eliminar
  const { data: venta, error: errFetch } = await supabase
    .from(TABLA)
    .select('factura_url')
    .eq('id', id)
    .single()

  if (errFetch) throw errFetch

  // eliminar ayudantes y detalle antes del registro principal
  const { error: errAyudantes } = await supabase
    .from(TABLA_AYUDANTES)
    .delete()
    .eq('venta_id', id)

  if (errAyudantes) throw errAyudantes

  const { error: errDetalle } = await supabase
    .from(TABLA_DETALLE)
    .delete()
    .eq('venta_id', id)

  if (errDetalle) throw errDetalle

  const { error } = await supabase.from(TABLA).delete().eq('id', id)
  if (error) throw error

  // limpiar archivo del storage si existía (no bloqueante si falla)
  if (venta.factura_url) {
    await supabase.storage.from('facturas').remove([venta.factura_url]).catch(() => null)
  }
}

export async function insertarDevolucion(
  values: VentaFormValues,
  facturaPath: string | null
): Promise<number> {
  const { data, error } = await supabase
    .from(TABLA)
    .insert({
      codigo: values.codigo.trim(),
      marca_id: values.marca_id ? Number(values.marca_id) : null,
      cantidad_productos: values.cantidad_productos ? Number(values.cantidad_productos) : null,
      cantidad_total: values.cantidad_total ? Number(values.cantidad_total) : null,
      fecha: values.fecha || null,
      factura_url: facturaPath,
      estado: 'Devolucion' satisfies EstadoVenta,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

// inserta los productos extraídos de la factura en detalle_ventas
// busca cada producto por código dinámicamente (corrige Bug 7 del original)
export async function insertarProductosVenta(
  ventaId: number,
  productos: FacturaProducto[]
): Promise<{ insertados: number; omitidos: number }> {
  let insertados = 0
  let omitidos = 0

  for (const p of productos) {
    const codigoNumerico = parseInt(p.codigo)
    if (!codigoNumerico || isNaN(codigoNumerico)) {
      omitidos++
      continue
    }

    let query = supabase
      .from('productos')
      .select('id')
      .eq('codigo', codigoNumerico)

    // filtrar por marca solo si viene del parser
    if (p.marca) {
      const { data: marcaData } = await supabase
        .from('marcas')
        .select('id')
        .ilike('nombre', p.marca.trim())
        .maybeSingle()

      if (marcaData?.id) {
        query = query.eq('marca_id', marcaData.id)
      }
    }

    const { data: productoExistente } = await query.maybeSingle()

    if (!productoExistente) {
      omitidos++
      continue
    }

    const { error } = await supabase.from(TABLA_DETALLE).insert({
      venta_id: ventaId,
      producto_id: productoExistente.id,
      cantidad: p.cantidad || 0,
      fecha_caducidad: null,
      ubicacion: null,
    })

    if (error) {
      console.error('Error insertando detalle de venta:', error)
      omitidos++
    } else {
      insertados++
    }
  }

  return { insertados, omitidos }
}

export async function eliminarDetalleVenta(detalleId: number): Promise<void> {
  // Bug 2 del original: usaba data[0].venta_id después de delete que no devuelve data
  // aquí simplemente eliminamos por id, sin depender del retorno
  const { error } = await supabase
    .from(TABLA_DETALLE)
    .delete()
    .eq('id', detalleId)

  if (error) throw error
}

export async function asignarEquipo(
  ventaId: number,
  responsableAuthId: string,
  ayudantesIds: number[]
): Promise<void> {
  // actualizar responsable en la venta
  const { error: errVenta } = await supabase
    .from(TABLA)
    .update({ usuario: responsableAuthId })
    .eq('id', ventaId)

  if (errVenta) throw errVenta

  // reemplazar ayudantes: borrar los anteriores e insertar los nuevos
  const { error: errDelete } = await supabase
    .from(TABLA_AYUDANTES)
    .delete()
    .eq('venta_id', ventaId)

  if (errDelete) throw errDelete

  if (ayudantesIds.length > 0) {
    const filas = ayudantesIds.map(uid => ({ venta_id: ventaId, usuario_id: uid }))
    const { error: errInsert } = await supabase.from(TABLA_AYUDANTES).insert(filas)
    if (errInsert) throw errInsert
  }
}
