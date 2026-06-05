import * as XLSX from 'xlsx'
import type { FacturaParseada, FacturaProducto } from '@/types/ventas'

/*
  Formato esperado del Excel de ventas:
  Fila 1: A1 = "MARCA:"   | B1 = nombre de la marca
  Fila 2: A2 = "CODIGO"  | B2 = "CANTIDAD"  (cabeceras)
  Fila 3+: código numérico | cantidad
*/

export function parsearExcel(file: File): Promise<FacturaParseada> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = e => {
      try {
        const buffer = e.target?.result
        if (!buffer) throw new Error('No se pudo leer el archivo.')

        const wb = XLSX.read(new Uint8Array(buffer as ArrayBuffer), { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const filas = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' })

        if (filas.length < 3) {
          throw new Error('El Excel debe tener al menos 3 filas (encabezado + cabeceras + datos).')
        }

        const fila1 = filas[0] as string[]
        const fila2 = filas[1] as string[]

        if (String(fila1[0]).trim().toUpperCase() !== 'MARCA:') {
          throw new Error('La celda A1 debe contener el texto "MARCA:".')
        }

        const marca = String(fila1[1] ?? '').trim().toUpperCase()
        if (!marca) throw new Error('La celda B1 debe tener el nombre de la marca.')

        if (
          String(fila2[0]).trim().toUpperCase() !== 'CODIGO' ||
          String(fila2[1]).trim().toUpperCase() !== 'CANTIDAD'
        ) {
          throw new Error('La fila 2 debe tener "CODIGO" en A2 y "CANTIDAD" en B2.')
        }

        const productos: FacturaProducto[] = []

        for (let i = 2; i < filas.length; i++) {
          const fila = filas[i] as Array<string | number>
          if (!fila || !fila[0]) continue

          const codigo = String(fila[0]).trim()
          const codigoNum = parseInt(codigo)
          if (isNaN(codigoNum) || codigoNum <= 0) continue

          const cantidad = parseInt(String(fila[1])) || 0

          productos.push({ codigo, nombre: null, cantidad, marca })
        }

        if (productos.length === 0) {
          throw new Error('No se encontraron productos válidos en el Excel.')
        }

        resolve({
          pedidoNo: String(Date.now()),
          fecha: new Date().toISOString().split('T')[0],
          marca,
          cantidadProductos: productos.length,
          cantidadTotal: productos.reduce((s, p) => s + p.cantidad, 0),
          productos,
        })
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Error al leer el archivo.'))
    reader.readAsArrayBuffer(file)
  })
}
