import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parsearExcel } from '@/utils/parsearExcel'

// arma un File .xlsx en memoria a partir de un arreglo de filas, igual al formato esperado
function crearExcelFile(filas: unknown[][]): File {
  const ws = XLSX.utils.aoa_to_sheet(filas)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Hoja1')
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return new File([buffer], 'pedido.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

const FILAS_VALIDAS = [
  ['MARCA:', 'jumex'],
  ['CODIGO', 'CANTIDAD'],
  [100492, 80],
  [100136, 135],
]

describe('parsearExcel', () => {
  it('parsea un excel válido con formato MARCA/CODIGO/CANTIDAD', async () => {
    const resultado = await parsearExcel(crearExcelFile(FILAS_VALIDAS))

    expect(resultado.marca).toBe('JUMEX')
    expect(resultado.productos).toHaveLength(2)
    expect(resultado.productos[0]).toEqual({
      codigo: '100492',
      nombre: null,
      cantidad: 80,
      marca: 'JUMEX',
    })
    expect(resultado.cantidadProductos).toBe(2)
    expect(resultado.cantidadTotal).toBe(215)
  })

  it('rechaza si tiene menos de 3 filas', async () => {
    const filas = [['MARCA:', 'JUMEX'], ['CODIGO', 'CANTIDAD']]
    await expect(parsearExcel(crearExcelFile(filas))).rejects.toThrow(
      'al menos 3 filas'
    )
  })

  it('rechaza si A1 no dice "MARCA:"', async () => {
    const filas = [['MARCA', 'JUMEX'], ['CODIGO', 'CANTIDAD'], [100492, 80]]
    await expect(parsearExcel(crearExcelFile(filas))).rejects.toThrow(
      'MARCA:'
    )
  })

  it('rechaza si B1 no tiene nombre de marca', async () => {
    const filas = [['MARCA:', ''], ['CODIGO', 'CANTIDAD'], [100492, 80]]
    await expect(parsearExcel(crearExcelFile(filas))).rejects.toThrow(
      'nombre de la marca'
    )
  })

  it('rechaza si la fila 2 no tiene los encabezados correctos', async () => {
    const filas = [['MARCA:', 'JUMEX'], ['COD', 'CANT'], [100492, 80]]
    await expect(parsearExcel(crearExcelFile(filas))).rejects.toThrow(
      'CODIGO'
    )
  })

  it('ignora filas con código no numérico y usa cantidad 0 si falta', async () => {
    const filas = [
      ['MARCA:', 'JUMEX'],
      ['CODIGO', 'CANTIDAD'],
      ['ABC', 80],
      [100492, ''],
    ]
    const resultado = await parsearExcel(crearExcelFile(filas))

    expect(resultado.productos).toHaveLength(1)
    expect(resultado.productos[0].codigo).toBe('100492')
    expect(resultado.productos[0].cantidad).toBe(0)
  })

  it('rechaza si no queda ningún producto válido', async () => {
    const filas = [
      ['MARCA:', 'JUMEX'],
      ['CODIGO', 'CANTIDAD'],
      ['ABC', 80],
    ]
    await expect(parsearExcel(crearExcelFile(filas))).rejects.toThrow(
      'No se encontraron productos válidos'
    )
  })
})
