import { supabase } from '@/lib/supabase'
import type {
  Producto,
  ProductoRaw,
  ProductoEditable,
  ProductoFormValues,
  FiltrosProductos,
} from '@/types/productos'

const TABLA = 'productos'

// sin la columna "cajas" (col int) para evitar colisión con la relación "cajas" (tabla)
// el valor de cajas_por_tarima se carga aparte en fetchProductoEditable
const SELECT_LISTA = `
  id, codigo, nombre, cantidad,
  rack_ref:racks(id, codigo_rack),
  marcas(id, nombre),
  piso(cantidad),
  cajas(id, cantidad),
  suelto(id, cantidad)
`.trim()

const SELECT_EDITABLE = 'id, codigo, nombre, marca_id, cajas, cantidad'

function calcularTotales(raw: ProductoRaw): Producto {
  const cantidad_piso = raw.piso.reduce((t, item) => t + (item.cantidad ?? 0), 0)
  const cantidad_suelto = raw.suelto.reduce((t, item) => t + (item.cantidad ?? 0), 0)
  // tarimas = cajas con stock + registros sueltos (mismo criterio que el sistema anterior)
  const tarimas = raw.cajas.filter(c => c.cantidad > 0).length + raw.suelto.length

  return {
    ...raw,
    cantidad_piso,
    cantidad_suelto,
    tarimas,
    total: cantidad_piso + cantidad_suelto + (raw.cantidad ?? 0),
  }
}

export async function fetchProductos(
  filtros?: FiltrosProductos,
  busqueda?: string
): Promise<Producto[]> {
  let query = supabase.from(TABLA).select(SELECT_LISTA)

  if (filtros?.marca) query = query.eq('marca_id', filtros.marca)

  if (busqueda?.trim()) {
    const esNumero = !isNaN(Number(busqueda)) && busqueda.trim() !== ''
    if (esNumero) {
      query = query.or(`codigo.eq.${busqueda},codigo::text.like.${busqueda}%`)
    } else {
      query = query.ilike('nombre', `%${busqueda}%`)
    }
  }

  const { data, error } = await query.order('id', { ascending: false })
  if (error) throw error
  return (data as unknown as ProductoRaw[]).map(calcularTotales)
}

export async function fetchProductoEditable(id: number): Promise<ProductoEditable> {
  const { data, error } = await supabase
    .from(TABLA)
    .select(SELECT_EDITABLE)
    .eq('id', id)
    .single()
  if (error) throw error
  return {
    id: data.id,
    codigo: data.codigo,
    nombre: data.nombre,
    marca_id: data.marca_id,
    cajas_por_tarima: data.cajas,
    cantidad: data.cantidad,
  }
}

export async function insertarProducto(values: ProductoFormValues): Promise<void> {
  const { error } = await supabase.from(TABLA).insert({
    codigo: values.codigo,
    nombre: toCapitalize(values.nombre),
    marca_id: values.marca_id ? Number(values.marca_id) : null,
    cajas: values.cajas_por_tarima ? Number(values.cajas_por_tarima) : null,
    cantidad: values.cantidad ? Number(values.cantidad) : 0,
  })
  if (error) throw error
}

export async function editarProducto(
  id: number,
  values: ProductoFormValues
): Promise<void> {
  const { error } = await supabase
    .from(TABLA)
    .update({
      codigo: values.codigo,
      nombre: toCapitalize(values.nombre),
      marca_id: values.marca_id ? Number(values.marca_id) : null,
      cajas: values.cajas_por_tarima ? Number(values.cajas_por_tarima) : null,
      cantidad: values.cantidad ? Number(values.cantidad) : 0,
    })
    .eq('id', id)
  if (error) throw error
}

export async function eliminarProducto(id: number): Promise<void> {
  const { error } = await supabase.from(TABLA).delete().eq('id', id)
  if (error) throw error
}

// devuelve "codigo-marca_id" de los que ya existen → evita duplicados en carga masiva
export async function verificarCodigosExistentes(
  items: Array<{ codigo: string; marca_id: number | null }>
): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('codigo, marca_id')
    .in('codigo', items.map(i => i.codigo))
  if (error) throw error
  return (data ?? []).map(row => `${row.codigo}-${row.marca_id}`)
}

export async function insertarProductosMasivo(
  productos: Array<{ codigo: string; nombre: string; marca_id: number | null }>
): Promise<number> {
  const { data, error } = await supabase.from(TABLA).insert(productos).select()
  if (error) throw error
  return data?.length ?? 0
}

// info mínima de un producto — usada para mostrar título en vista de cajas
export async function fetchProductoBasico(
  id: number
): Promise<{ id: number; codigo: number; nombre: string }> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id, codigo, nombre')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// capitalize estilo "Primera Letra De Cada Palabra"
function toCapitalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\S/g, c => c.toUpperCase())
    .trim()
}
