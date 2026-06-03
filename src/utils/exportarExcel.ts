import * as XLSX from 'xlsx'
import type { Producto } from '@/types/productos'

// exporta los productos actuales (respeta el filtro/búsqueda activos)
export function exportarProductosExcel(productos: Producto[]) {
  const filas = productos.map(p => ({
    Código: p.codigo,
    Nombre: p.nombre,
    Marca: p.marcas?.nombre ?? '',
    Tarimas: p.tarimas,
    Piso: p.cantidad_piso,
    Suelto: p.cantidad_suelto,
    Total: p.total,
  }))

  const ws = XLSX.utils.json_to_sheet(filas)

  // ancho mínimo por columna para que se vea legible sin ajuste manual
  ws['!cols'] = [
    { wch: 10 },
    { wch: 35 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

  const fecha = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `inventario-${fecha}.xlsx`)
}
