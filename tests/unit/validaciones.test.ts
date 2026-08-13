import { describe, it, expect } from 'vitest'
import { reglas } from '@/utils/validaciones'

describe('reglas.codigoNumerico', () => {
  it('acepta solo dígitos', () => {
    expect(reglas.codigoNumerico.pattern.value.test('100492')).toBe(true)
  })

  it('rechaza letras y símbolos', () => {
    expect(reglas.codigoNumerico.pattern.value.test('100492A')).toBe(false)
    expect(reglas.codigoNumerico.pattern.value.test('100-492')).toBe(false)
  })

  it('rechaza vacío', () => {
    expect(reglas.codigoNumerico.pattern.value.test('')).toBe(false)
  })

  it('define un máximo de 20 dígitos', () => {
    expect(reglas.codigoNumerico.maxLength.value).toBe(20)
  })
})

describe('reglas.correo', () => {
  it('acepta correos válidos', () => {
    expect(reglas.correo.pattern.value.test('ivan@gmail.com')).toBe(true)
    expect(reglas.correo.pattern.value.test('nombre.apellido@dominio.co')).toBe(true)
  })

  it('rechaza correos sin arroba o sin dominio', () => {
    expect(reglas.correo.pattern.value.test('ivangmail.com')).toBe(false)
    expect(reglas.correo.pattern.value.test('ivan@gmail')).toBe(false)
  })
})

describe('reglas.password', () => {
  it('exige mínimo 8 caracteres', () => {
    expect(reglas.password.minLength.value).toBe(8)
  })
})

describe('reglas.nombre y reglas.codigoTexto — sanitización', () => {
  it('rechaza caracteres que podrían usarse para inyección de HTML', () => {
    expect(reglas.nombre.pattern.value.test('<script>alert(1)</script>')).toBe(false)
    expect(reglas.nombre.pattern.value.test('Producto {malicioso}')).toBe(false)
  })

  it('acepta texto normal con acentos y ñ', () => {
    expect(reglas.nombre.pattern.value.test('Jugo de Piña Colada')).toBe(true)
  })
})
