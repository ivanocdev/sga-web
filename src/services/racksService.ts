import { supabase } from '@/lib/supabase'
import type { Rack, RackFormValues } from '@/types/racks'

const TABLA = 'racks'

const SELECT_LISTA = `
  id, codigo_rack, nivel, posicion, lado, marca_id,
  marcas(id, nombre),
  cajas(producto:producto_id(id, nombre, codigo))
`.trim()

function procesarRack(raw: RackRaw): Rack {
  const cajas = raw.cajas ?? []

  // productos únicos que tienen cajas en este rack
  const productosUnicos = cajas
    .map(c => c.producto)
    .filter((p): p is NonNullable<typeof p> => p !== null)

  return {
    id: raw.id,
    codigo_rack: raw.codigo_rack,
    nivel: raw.nivel,
    posicion: raw.posicion,
    lado: raw.lado,
    marca_id: raw.marca_id,
    marcas: raw.marcas,
    ocupado: cajas.length > 0,
    productos_info: productosUnicos,
  }
}

export async function fetchRacks(busqueda?: string): Promise<Rack[]> {
  let query = supabase.from(TABLA).select(SELECT_LISTA)

  if (busqueda?.trim()) {
    query = query.or(
      `codigo_rack.ilike.%${busqueda}%,posicion.ilike.%${busqueda}%`
    )
  }

  const { data, error } = await query.order('id', { ascending: true })
  if (error) throw error
  return (data as unknown as RackRaw[]).map(procesarRack)
}

// solo racks disponibles para asignar a una caja
// si se está editando, incluye también el rack que ya tiene asignado el registro
export async function fetchRacksLibres(rack_id_actual?: number): Promise<Pick<Rack, 'id' | 'codigo_rack' | 'nivel' | 'lado' | 'posicion'>[]> {
  let query = supabase
    .from(TABLA)
    .select('id, codigo_rack, nivel, lado, posicion')

  if (rack_id_actual) {
    query = query.or(`ocupado.eq.false,id.eq.${rack_id_actual}`)
  } else {
    query = query.eq('ocupado', false)
  }

  const { data, error } = await query
    .order('nivel', { ascending: true })
    .order('lado', { ascending: true })
    .order('posicion', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function insertarRack(values: RackFormValues): Promise<void> {
  // verificar código duplicado antes de insertar
  const { data: existente, error: errVerificacion } = await supabase
    .from(TABLA)
    .select('id')
    .eq('codigo_rack', values.codigo_rack.trim())
    .maybeSingle()

  if (errVerificacion) throw errVerificacion

  if (existente) {
    throw new Error('Ya existe un rack con ese código.')
  }

  const { error } = await supabase.from(TABLA).insert({
    codigo_rack: values.codigo_rack.trim().toUpperCase(),
    nivel: values.nivel.trim().toUpperCase(),
    posicion: values.posicion.trim(),
    lado: values.lado.trim(),
    marca_id: values.marca_id ? Number(values.marca_id) : null,
    ocupado: false,
  })
  if (error) throw error
}

export async function editarRack(id: number, values: RackFormValues): Promise<void> {
  const { error } = await supabase
    .from(TABLA)
    .update({
      codigo_rack: values.codigo_rack.trim().toUpperCase(),
      nivel: values.nivel.trim().toUpperCase(),
      posicion: values.posicion.trim(),
      lado: values.lado.trim(),
      marca_id: values.marca_id ? Number(values.marca_id) : null,
    })
    .eq('id', id)
  if (error) throw error
}

export async function eliminarRack(id: number): Promise<void> {
  // no permitir eliminar si hay productos con cajas asignadas a este rack
  const { data: cajasEnRack, error: errCheck } = await supabase
    .from('cajas')
    .select('id')
    .eq('rack_id', id)
    .limit(1)

  if (errCheck) throw errCheck

  if (cajasEnRack && cajasEnRack.length > 0) {
    throw new Error('Este rack tiene cajas asignadas. Mueve o elimina las cajas primero.')
  }

  const { error } = await supabase.from(TABLA).delete().eq('id', id)
  if (error) throw error
}

// tipos internos del SELECT con joins — no se exportan
interface RackRaw {
  id: number
  codigo_rack: string
  nivel: string
  posicion: string
  lado: string
  marca_id: number | null
  marcas: { id: number; nombre: string } | null
  cajas: Array<{ producto: { id: number; nombre: string; codigo: number } | null }>
}
