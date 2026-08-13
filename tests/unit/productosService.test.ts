import { describe, it, expect, vi, beforeEach } from 'vitest'

// query builder falso que encadena como el real (from().select().eq()...) y resuelve
// con { data, error } al hacer await — así se prueba el service sin pegarle a Supabase real
function crearQueryMock(resultado: { data: unknown; error: unknown }) {
  const mock: Record<string, unknown> = {}
  const encadenable = ['select', 'eq', 'ilike', 'or', 'in', 'order', 'insert', 'update', 'delete']
  for (const metodo of encadenable) {
    mock[metodo] = vi.fn(() => mock)
  }
  mock.single = vi.fn(() => Promise.resolve(resultado))
  // hace que `await query` resuelva con el resultado sin necesidad de .single()
  mock.then = (resolve: (v: typeof resultado) => void) => resolve(resultado)
  return mock
}

const fromMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}))

const { fetchProductos, insertarProducto, eliminarProducto } = await import(
  '@/services/productosService'
)

const PRODUCTO_RAW = {
  id: 1,
  codigo: 100492,
  nombre: 'Producto Uno',
  cantidad: 5,
  rack_ref: null,
  marcas: { id: 2, nombre: 'JUMEX' },
  piso: [{ cantidad: 10 }],
  cajas: [{ id: 1, cantidad: 80 }],
  suelto: [],
}

describe('productosService (integración con Supabase simulado)', () => {
  beforeEach(() => {
    fromMock.mockReset()
  })

  it('fetchProductos mapea las filas crudas aplicando calcularTotales', async () => {
    const query = crearQueryMock({ data: [PRODUCTO_RAW], error: null })
    fromMock.mockReturnValue(query)

    const productos = await fetchProductos()

    expect(fromMock).toHaveBeenCalledWith('productos')
    expect(productos).toHaveLength(1)
    // cantidad_piso/tarimas/total no vienen de la DB, los calcula el service
    expect(productos[0].cantidad_piso).toBe(10)
    expect(productos[0].tarimas).toBe(1)
    expect(productos[0].total).toBe(15) // piso(10) + suelto(0) + cantidad(5)
  })

  it('fetchProductos filtra por marca cuando se pasa el filtro', async () => {
    const query = crearQueryMock({ data: [], error: null })
    fromMock.mockReturnValue(query)

    await fetchProductos({ marca: 2 })

    expect(query.eq).toHaveBeenCalledWith('marca_id', 2)
  })

  it('fetchProductos busca por ilike cuando la búsqueda no es numérica', async () => {
    const query = crearQueryMock({ data: [], error: null })
    fromMock.mockReturnValue(query)

    await fetchProductos(undefined, 'jugo')

    expect(query.ilike).toHaveBeenCalledWith('nombre', '%jugo%')
  })

  it('fetchProductos usa or() cuando la búsqueda es numérica (busca por código)', async () => {
    const query = crearQueryMock({ data: [], error: null })
    fromMock.mockReturnValue(query)

    await fetchProductos(undefined, '100492')

    expect(query.or).toHaveBeenCalled()
    expect(query.ilike).not.toHaveBeenCalled()
  })

  it('fetchProductos propaga el error de Supabase', async () => {
    const query = crearQueryMock({ data: null, error: new Error('fallo de red') })
    fromMock.mockReturnValue(query)

    await expect(fetchProductos()).rejects.toThrow('fallo de red')
  })

  it('insertarProducto capitaliza el nombre y convierte los campos numéricos', async () => {
    const query = crearQueryMock({ data: null, error: null })
    fromMock.mockReturnValue(query)

    await insertarProducto({
      codigo: '100492',
      nombre: 'jugo de manzana',
      marca_id: '2',
      cajas_por_tarima: '12',
      cantidad: '5',
    })

    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Jugo De Manzana',
        marca_id: 2,
        cajas: 12,
        cantidad: 5,
      })
    )
  })

  it('eliminarProducto solo filtra por id, sin depender del data devuelto por delete()', async () => {
    const query = crearQueryMock({ data: null, error: null })
    fromMock.mockReturnValue(query)

    await eliminarProducto(1)

    expect(query.delete).toHaveBeenCalled()
    expect(query.eq).toHaveBeenCalledWith('id', 1)
  })
})
