import { describe, it, expect } from 'vitest'
import { detectarFormato } from '@/utils/parsearPdf'

// los fixtures son texto plano tal como lo devolvería pdfjs-dist (extraerTexto),
// no PDFs reales — así se prueba la lógica de parseo sin depender del binario ni de red

describe('detectarFormato', () => {
  it('devuelve null si no reconoce ningún formato', () => {
    expect(detectarFormato('un texto cualquiera sin ningún patrón conocido')).toBeNull()
  })

  it('parsea el formato A (Pedido No + Caj XBX)', () => {
    const texto = [
      'FORMATOA EMPRESA',
      'Pedido No 12345',
      '2026-01-15T10:30:00',
      '100492 - Producto Ejemplo Uno',
      '0%',
      '1,234.56',
      'Caj XBX',
      '80',
      '100136 - Producto Ejemplo Dos',
      'Caj XBX',
      '135',
    ].join('\n')

    const resultado = detectarFormato(texto)

    expect(resultado?.pedidoNo).toBe('12345')
    expect(resultado?.fecha).toBe('2026-01-15')
    expect(resultado?.marca).toBe('FORMATOA EMPRESA')
    expect(resultado?.productos).toEqual([
      { codigo: '100492', nombre: 'Producto Ejemplo Uno', cantidad: 80, marca: null },
      { codigo: '100136', nombre: 'Producto Ejemplo Dos', cantidad: 135, marca: null },
    ])
    expect(resultado?.cantidadTotal).toBe(215)
  })

  it('parsea el formato JUMEX', () => {
    const texto = [
      'JUMEX EMPRESA',
      'Folio 98765',
      '2026-02-20T09:00:00',
      '',
      'Producto Jumex Uno',
      '',
      'XBX',
      '1',
      '',
      '80',
      '1',
      '',
      '1,234.56',
      '',
      '2,345.67',
      '123456789012',
    ].join('\n')

    const resultado = detectarFormato(texto)

    expect(resultado?.pedidoNo).toBe('98765')
    expect(resultado?.fecha).toBe('2026-02-20')
    expect(resultado?.marca).toBe('JUMEX')
    expect(resultado?.productos).toEqual([
      { codigo: '123456789012', nombre: 'Producto Jumex Uno', cantidad: 80, marca: 'JUMEX' },
    ])
    expect(resultado?.cantidadTotal).toBe(80)
  })

  it('parsea el formato Con Alimentos y suma todas las cantidades con unidad CJ', () => {
    const texto = [
      'Con Alimentos S.A. de C.V.',
      '2026-03-10T08:00:00',
      '',
      '1234567890',
      '',
      '101',
      '1234567890123',
      '12345678',
      'Producto Alimentos Ejemplo',
      'XBX',
      '50 CJ',
    ].join('\n')

    const resultado = detectarFormato(texto)

    expect(resultado?.pedidoNo).toBe('1234567890')
    expect(resultado?.fecha).toBe('2026-03-10')
    expect(resultado?.marca).toBe('CON ALIMENTOS')
    expect(resultado?.productos).toEqual([
      { codigo: '101', nombre: 'Producto Alimentos Ejemplo', cantidad: 50, marca: 'CON ALIMENTOS' },
    ])
    // corrige el bug del original que solo tomaba el último CJ en vez de sumar todos
    expect(resultado?.cantidadTotal).toBe(50)
  })

  it('parsea el formato La Costeña y lee el total desde TOTALES', () => {
    const texto = [
      'La Costeña Alimentos',
      '2026-04-05T11:15:00',
      '',
      '9876543210',
      '',
      '202',
      '9876543210123',
      '87654321',
      'Producto Costeña Ejemplo',
      'XBX',
      '30',
      '',
      'TOTALES',
      '30',
    ].join('\n')

    const resultado = detectarFormato(texto)

    expect(resultado?.pedidoNo).toBe('9876543210')
    expect(resultado?.fecha).toBe('2026-04-05')
    expect(resultado?.marca).toBe('LA COSTEÑA')
    expect(resultado?.productos).toEqual([
      { codigo: '202', nombre: 'Producto Costeña Ejemplo', cantidad: 30, marca: 'LA COSTEÑA' },
    ])
    expect(resultado?.cantidadTotal).toBe(30)
  })

  it('deduplica productos con el mismo código en formato A', () => {
    const texto = [
      'FORMATOA EMPRESA',
      'Pedido No 111',
      '100492 - Producto Uno',
      'Caj XBX',
      '10',
      '100492 - Producto Uno Repetido',
      'Caj XBX',
      '20',
    ].join('\n')

    const resultado = detectarFormato(texto)

    expect(resultado?.productos).toHaveLength(1)
    expect(resultado?.productos[0].codigo).toBe('100492')
  })
})
