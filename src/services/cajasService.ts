import { supabase } from '@/lib/supabase'
import type { RegistroCaja, RegistroCajaFormValues, TipoRegistro } from '@/types/cajas'

export async function fetchRegistrosPorProducto(productoId: number): Promise<RegistroCaja[]> {
  const [{ data: cajas }, { data: sueltos }, { data: pisos }] = await Promise.all([
    supabase
      .from('cajas')
      .select('*, racks(codigo_rack)')
      .eq('producto_id', productoId)
      .gt('cantidad', 0),
    supabase
      .from('suelto')
      .select('*')
      .eq('producto_id', productoId)
      .gt('cantidad', 0),
    supabase
      .from('piso')
      .select('*')
      .eq('producto_id', productoId)
      .gt('cantidad', 0),
  ])

  const cajasFormateadas: RegistroCaja[] = (cajas ?? []).map(c => ({
    id: c.id,
    producto_id: c.producto_id,
    cantidad: c.cantidad,
    fecha_caducidad: c.fecha_caducidad ?? null,
    codigo_barras: c.codigo_barras ?? null,
    fecha_entrada: c.fecha_entrada ?? null,
    rack_id: c.rack_id ?? null,
    tipo: 'caja',
    ubicacion: c.racks?.codigo_rack ?? '-',
  }))

  const sueltosFormateados: RegistroCaja[] = (sueltos ?? []).map(s => ({
    id: s.id,
    producto_id: s.producto_id,
    cantidad: s.cantidad,
    fecha_caducidad: s.fecha_caducidad ?? null,
    codigo_barras: s.codigo_barras ?? null,
    fecha_entrada: s.fecha_entrada ?? null,
    rack_id: null,
    tipo: 'suelto',
    ubicacion: 'SUELTO',
  }))

  const pisosFormateados: RegistroCaja[] = (pisos ?? []).map(p => ({
    id: p.id,
    producto_id: p.producto_id,
    cantidad: p.cantidad,
    fecha_caducidad: p.fecha_caducidad ?? null,
    codigo_barras: p.codigo_barras ?? null,
    fecha_entrada: null,
    rack_id: null,
    tipo: 'piso',
    ubicacion: 'EN PISO',
  }))

  const todos = [...cajasFormateadas, ...sueltosFormateados, ...pisosFormateados]

  // FIFO: ordenar por fecha_caducidad ASC, registros sin fecha van al final
  return todos.sort((a, b) => {
    if (!a.fecha_caducidad && !b.fecha_caducidad) return 0
    if (!a.fecha_caducidad) return 1
    if (!b.fecha_caducidad) return -1
    return new Date(a.fecha_caducidad).getTime() - new Date(b.fecha_caducidad).getTime()
  })
}

export async function insertarRegistro(
  values: RegistroCajaFormValues,
  productoId: number,
  tipo: TipoRegistro
): Promise<void> {
  const base = {
    producto_id: productoId,
    cantidad: Number(values.cantidad),
    fecha_caducidad: values.fecha_caducidad || null,
    codigo_barras: values.codigo_barras.trim() || null,
  }

  if (tipo === 'caja') {
    const rack_id = values.rack_id ? Number(values.rack_id) : null

    const { error } = await supabase
      .from('cajas')
      .insert([{ ...base, rack_id }])

    if (error) throw error

    if (rack_id) {
      // marcar el rack como ocupado y actualizar rack_id del producto
      await Promise.all([
        supabase.from('racks').update({ ocupado: true }).eq('id', rack_id),
        supabase.from('productos').update({ rack_id }).eq('id', productoId),
      ])
    }
    return
  }

  const tabla = tipo === 'suelto' ? 'suelto' : 'piso'
  const { error } = await supabase.from(tabla).insert([base])
  if (error) throw error
}

export async function editarRegistro(
  values: RegistroCajaFormValues,
  registro: RegistroCaja
): Promise<void> {
  const base = {
    cantidad: Number(values.cantidad),
    fecha_caducidad: values.fecha_caducidad || null,
    codigo_barras: values.codigo_barras.trim() || null,
  }

  if (registro.tipo === 'caja') {
    const nuevoRackId = values.rack_id ? Number(values.rack_id) : null
    const rackCambio = nuevoRackId !== registro.rack_id

    const { error } = await supabase
      .from('cajas')
      .update({ ...base, rack_id: nuevoRackId })
      .eq('id', registro.id)

    if (error) throw error

    if (rackCambio) {
      if (registro.rack_id) {
        await supabase.from('racks').update({ ocupado: false }).eq('id', registro.rack_id)
      }
      if (nuevoRackId) {
        await supabase.from('racks').update({ ocupado: true }).eq('id', nuevoRackId)
      }
    }
    return
  }

  const tabla = registro.tipo === 'suelto' ? 'suelto' : 'piso'
  const { error } = await supabase.from(tabla).update(base).eq('id', registro.id)
  if (error) throw error
}

export async function eliminarRegistro(registro: RegistroCaja): Promise<void> {
  if (registro.tipo === 'caja') {
    const { error } = await supabase.from('cajas').delete().eq('id', registro.id)
    if (error) throw error

    // liberar el rack solo si nadie más lo tiene asignado
    if (registro.rack_id) {
      const { data: cajasEnRack } = await supabase
        .from('cajas')
        .select('id')
        .eq('rack_id', registro.rack_id)
        .gt('cantidad', 0)
        .limit(1)

      if (!cajasEnRack?.length) {
        await supabase.from('racks').update({ ocupado: false }).eq('id', registro.rack_id)
      }
    }
    return
  }

  const tabla = registro.tipo === 'suelto' ? 'suelto' : 'piso'
  const { error } = await supabase.from(tabla).delete().eq('id', registro.id)
  if (error) throw error
}
