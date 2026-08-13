import { describe, it, expect } from 'vitest'
import { calcularTotales } from '@/services/productosService'
import type { ProductoRaw } from '@/types/productos'

function crearRaw(overrides: Partial<ProductoRaw> = {}): ProductoRaw {
  return {
    id: 1,
    codigo: 100492,
    nombre: 'Producto de prueba',
    cantidad: 0,
    rack_ref: null,
    marcas: null,
    piso: [],
    cajas: [],
    suelto: [],
    ...overrides,
  }
}

describe('calcularTotales', () => {
  it('suma cantidad_piso desde los registros de piso', () => {
    const raw = crearRaw({ piso: [{ cantidad: 10 }, { cantidad: 5 }] })
    expect(calcularTotales(raw).cantidad_piso).toBe(15)
  })

  it('suma cantidad_suelto desde los registros de suelto', () => {
    const raw = crearRaw({ suelto: [{ id: 1, cantidad: 7 }, { id: 2, cantidad: 3 }] })
    expect(calcularTotales(raw).cantidad_suelto).toBe(10)
  })

  it('cuenta tarimas como cajas con stock (>0) más registros sueltos', () => {
    const raw = crearRaw({
      cajas: [{ id: 1, cantidad: 80 }, { id: 2, cantidad: 0 }, { id: 3, cantidad: 40 }],
      suelto: [{ id: 1, cantidad: 5 }],
    })
    // 2 cajas con stock (la de cantidad 0 no cuenta) + 1 registro suelto
    expect(calcularTotales(raw).tarimas).toBe(3)
  })

  it('el total suma piso + suelto + cantidad propia del producto, sin contar cajas', () => {
    const raw = crearRaw({
      cantidad: 20,
      piso: [{ cantidad: 10 }],
      suelto: [{ id: 1, cantidad: 5 }],
      cajas: [{ id: 1, cantidad: 999 }], // no debe afectar el total
    })
    expect(calcularTotales(raw).total).toBe(35)
  })

  it('devuelve todo en cero cuando no hay piso, suelto ni cajas', () => {
    const resultado = calcularTotales(crearRaw())
    expect(resultado.cantidad_piso).toBe(0)
    expect(resultado.cantidad_suelto).toBe(0)
    expect(resultado.tarimas).toBe(0)
    expect(resultado.total).toBe(0)
  })

  it('conserva los campos originales del producto', () => {
    const raw = crearRaw({ codigo: 100136, nombre: 'Otro producto' })
    const resultado = calcularTotales(raw)
    expect(resultado.codigo).toBe(100136)
    expect(resultado.nombre).toBe('Otro producto')
  })
})
