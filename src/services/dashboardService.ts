import { supabase } from '@/lib/supabase'
import { format, isToday, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  VentasMarca,
  RacksMarca,
  CajasMarca,
  ProductosMarca,
  ProductoCaducar,
  PedidoActivo,
  MovimientoReciente,
  PedidoMes,
  EntradasSemanaData,
} from '@/types/dashboard'

// tipos internos para los joins anidados de Supabase
type MarcaConVentas = { nombre: string; ventas: { id: number }[] }
type MarcaConRacks = { nombre: string; racks: { id: number; ocupado: boolean }[] }
type MarcaConProductosCajas = { nombre: string; productos: { cajas: { id: number }[] }[] }
type MarcaConProductos = { nombre: string; productos: { id: number }[] }

export async function fetchVentasPorMarca(): Promise<VentasMarca[]> {
  const { data, error } = await supabase
    .from('marcas')
    .select('nombre, ventas(id)')
    .order('nombre')
  if (error) throw error
  return (data as unknown as MarcaConVentas[]).map(m => ({
    nombre: m.nombre,
    cantidad: m.ventas.length,
  }))
}

export async function fetchRacksPorMarca(): Promise<RacksMarca[]> {
  const { data, error } = await supabase
    .from('marcas')
    .select('nombre, racks(id, ocupado)')
    .order('nombre')
  if (error) throw error
  return (data as unknown as MarcaConRacks[]).map(m => ({
    nombre: m.nombre,
    total: m.racks.length,
    ocupados: m.racks.filter(r => r.ocupado).length,
  }))
}

export async function fetchCajasPorMarca(): Promise<CajasMarca[]> {
  const { data, error } = await supabase
    .from('marcas')
    .select('nombre, productos(cajas(id))')
    .order('nombre')
  if (error) throw error
  return (data as unknown as MarcaConProductosCajas[]).map(m => ({
    nombre: m.nombre,
    cantidad: m.productos.reduce((acc, p) => acc + (p.cajas?.length ?? 0), 0),
  }))
}

export async function fetchProductosPorMarca(): Promise<ProductosMarca[]> {
  const { data, error } = await supabase
    .from('marcas')
    .select('nombre, productos(id)')
    .order('nombre')
  if (error) throw error
  return (data as unknown as MarcaConProductos[]).map(m => ({
    nombre: m.nombre,
    cantidad: m.productos.length,
  }))
}

export async function fetchProximosCaducar(): Promise<ProductoCaducar[]> {
  const limite = new Date()
  limite.setDate(limite.getDate() + 30)

  // campos comunes en cajas, suelto y piso
  const SEL = 'id, fecha_caducidad, codigo_barras, productos(marcas(nombre))'

  const [cajasRes, sueltosRes, pisosRes] = await Promise.all([
    supabase.from('cajas').select(SEL).lte('fecha_caducidad', limite.toISOString()).gt('cantidad', 0),
    supabase.from('suelto').select(SEL).lte('fecha_caducidad', limite.toISOString()).gt('cantidad', 0),
    supabase.from('piso').select(SEL).lte('fecha_caducidad', limite.toISOString()).gt('cantidad', 0),
  ])

  const hoy = new Date()
  const items = [
    ...(cajasRes.data ?? []).map(i => ({ ...i, tipo: 'caja' as const })),
    ...(sueltosRes.data ?? []).map(i => ({ ...i, tipo: 'suelto' as const })),
    ...(pisosRes.data ?? []).map(i => ({ ...i, tipo: 'piso' as const })),
  ]

  return items
    .map(item => ({
      codigo_barras: item.codigo_barras ?? 'Sin código',
      marca: (item.productos as { marcas?: { nombre?: string } } | null)?.marcas?.nombre ?? 'Sin marca',
      dias: differenceInDays(new Date(item.fecha_caducidad!), hoy),
      tipo: item.tipo,
    }))
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 8)
}

export async function fetchPedidosActivos(): Promise<PedidoActivo[]> {
  const { data, error } = await supabase
    .from('ventas')
    .select('codigo, estado, fecha, marcas(nombre)')
    .not('estado', 'eq', 'completado')
    .order('fecha', { ascending: false })
    .limit(6)
  if (error) throw error
  return (data ?? []).map(v => ({
    codigo: v.codigo ?? 'Sin código',
    marca: (v.marcas as { nombre?: string } | null)?.nombre ?? 'Sin marca',
    estado: v.estado as string,
    fecha: v.fecha ? format(new Date(v.fecha), 'd MMM', { locale: es }) : null,
  }))
}

type RawMov = {
  pedido: string
  cantidad: string
  marca: string
  fechaRaw: string | null
  tipo: 'entrada' | 'salida'
}

export async function fetchMovimientosRecientes(): Promise<MovimientoReciente[]> {
  const [entradasRes, ventasRes] = await Promise.all([
    supabase
      .from('cajas')
      .select('id, cantidad, fecha_entrada, productos(codigo, marcas(nombre)), racks(codigo_rack)')
      .not('fecha_entrada', 'is', null)
      .order('fecha_entrada', { ascending: false })
      .limit(4),
    supabase
      .from('ventas')
      .select('id, codigo, cantidad_total, fecha, marcas(nombre)')
      .eq('estado', 'completado')
      .order('fecha', { ascending: false })
      .limit(4),
  ])

  const entradas: RawMov[] = (entradasRes.data ?? []).map(e => ({
    pedido: String((e.productos as { codigo?: unknown } | null)?.codigo ?? `E-${e.id}`),
    cantidad: String(e.cantidad ?? 0),
    marca: (e.productos as { marcas?: { nombre?: string } } | null)?.marcas?.nombre ?? 'Sin marca',
    fechaRaw: e.fecha_entrada,
    tipo: 'entrada',
  }))

  const salidas: RawMov[] = (ventasRes.data ?? []).map(v => ({
    pedido: v.codigo ?? `V-${v.id}`,
    cantidad: String(v.cantidad_total ?? 0),
    marca: (v.marcas as { nombre?: string } | null)?.nombre ?? 'Sin marca',
    fechaRaw: v.fecha,
    tipo: 'salida',
  }))

  return [...entradas, ...salidas]
    .sort((a, b) => (b.fechaRaw ?? '').localeCompare(a.fechaRaw ?? ''))
    .slice(0, 5)
    .map(m => ({
      pedido: m.pedido,
      cantidad: m.cantidad,
      marca: m.marca,
      dia: m.fechaRaw
        ? isToday(new Date(m.fechaRaw))
          ? 'Hoy'
          : format(new Date(m.fechaRaw), 'd MMM', { locale: es })
        : '—',
      tipo: m.tipo,
    }))
}

export async function fetchPedidosPorMes(): Promise<PedidoMes[]> {
  const anoActual = new Date().getFullYear()
  const { data, error } = await supabase
    .from('ventas')
    .select('fecha')
    .not('fecha', 'is', null)
    .gte('fecha', `${anoActual}-01-01`)
    .lte('fecha', `${anoActual}-12-31`)
  if (error) throw error

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const conteo: Record<string, number> = Object.fromEntries(MESES.map(m => [m, 0]))
  ;(data ?? []).forEach(v => {
    if (v.fecha) {
      const mes = MESES[new Date(v.fecha).getMonth()]
      conteo[mes]++
    }
  })
  return MESES.map(mes => ({ mes, cantidad: conteo[mes] }))
}

export async function fetchEntradasSemana(): Promise<EntradasSemanaData> {
  const hace7Dias = new Date()
  hace7Dias.setDate(hace7Dias.getDate() - 7)

  const { data, error } = await supabase
    .from('cajas')
    .select('fecha_entrada, productos(marcas(nombre))')
    .not('fecha_entrada', 'is', null)
    .gte('fecha_entrada', hace7Dias.toISOString())
  if (error) throw error

  const porMarca: Record<string, number> = {}
  let total = 0
  ;(data ?? []).forEach(e => {
    const nombre = (e.productos as { marcas?: { nombre?: string } } | null)?.marcas?.nombre ?? 'Sin marca'
    porMarca[nombre] = (porMarca[nombre] ?? 0) + 1
    total++
  })

  const items = Object.entries(porMarca)
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: total > 0 ? ((cantidad / total) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.cantidad - a.cantidad)

  return { data: items, total }
}
