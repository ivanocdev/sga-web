import * as pdfjsLib from 'pdfjs-dist'
import type { FacturaParseada, FacturaProducto } from '@/types/ventas'

// worker desde CDN — evita problemas con el bundler
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// extrae todo el texto del PDF página por página
async function extraerTexto(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({
    data: buffer,
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  }).promise

  const paginas: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // TextItem tiene str, TextMarkedContent no — el ternario evita el type predicate problemático
    const lineas = content.items
      .map(item => ('str' in item ? (item as { str: string }).str : ''))
      .filter(s => s.length > 0)
      .join('\n')
    paginas.push(lineas)
  }

  return paginas.join('\n')
}

function detectarFormato(texto: string): FacturaParseada | null {
  if (/Con Alimentos S\.A\. de C\.V\./i.test(texto)) return parseConAlimentos(texto)
  if (/lacost[eé]ña|la coste/i.test(texto)) return parseLaCostena(texto)
  if (/JUMEX/i.test(texto)) return parseJumex(texto)
  // detectar por estructura (Pedido No + Caj XBX) en lugar del nombre de emisor
  if (/Pedido\s+No/i.test(texto)) return parseFormatoA(texto)
  return null
}

export async function parsearPdf(file: File): Promise<FacturaParseada | null> {
  const texto = await extraerTexto(file)
  return detectarFormato(texto)
}

// ------- parsers por formato -------

function extraerFechaISO(texto: string): string | null {
  const m = texto.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/)
  return m ? m[1] : null
}

// formato de facturas con "Pedido No" y unidad "Caj XBX"
function parseFormatoA(texto: string): FacturaParseada {
  const pedidoMatch = texto.match(/Pedido\s+No\s*(\d+)/i)
  const fecha = extraerFechaISO(texto)
  const marcaMatch = texto.match(/^([A-ZÁÉÍÓÚ ]{3,})/m)

  const lineas = texto
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const prohibidas = /^(INFORMACION BANCARIA|Tipo de moneda|Serie|RFC|Referencia|Folio|Uso del|UUID)/i

  const productos: FacturaProducto[] = []

  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i]

    // patrón "CODIGO - Descripción"
    const patron1 = linea.match(/^C?(\d{3,7})\s*-\s*(.+)$/)
    if (patron1) {
      const codigo = patron1[1]
      let nombre = patron1[2].trim()

      // extender descripción con líneas siguientes hasta encontrar un marcador
      for (let j = i + 1; j < Math.min(i + 4, lineas.length); j++) {
        const sig = lineas[j]
        if (/^\d+%$|^[\d,]+\.\d+$|^\d{8}$|^Caj XBX$|^C?\d{3,7}/.test(sig)) break
        if (sig && sig !== '-') nombre += ' ' + sig
      }

      // limpiar sufijos numéricos y porcentajes
      nombre = nombre
        .replace(/\s*0%.*$/, '')
        .replace(/\s*[\d,]+\.\d+.*$/, '')
        .replace(/\s*\d+\.\d+\s+Kg.*$/, '')
        .replace(/\s*\d{8}.*$/, '')
        .trim()

      if (!nombre || /^\d/.test(nombre) || prohibidas.test(nombre)) continue

      productos.push({ codigo, nombre, cantidad: buscarCantidadA(lineas, i), marca: null })
      continue
    }

    // patrón código solo en su línea
    const patron2 = linea.match(/^C?(\d{3,7})$/)
    if (patron2) {
      const codigo = patron2[1]
      const nombre = construirNombreA(lineas, i + 1)
      if (!nombre || /^\d/.test(nombre) || prohibidas.test(nombre)) continue
      productos.push({ codigo, nombre, cantidad: buscarCantidadA(lineas, i), marca: null })
    }
  }

  // deduplicar por código
  const vistos = new Set<string>()
  const productosUnicos = productos.filter(p => {
    if (vistos.has(p.codigo)) return false
    vistos.add(p.codigo)
    return true
  })

  const cantidadTotal = productosUnicos.reduce((s, p) => s + p.cantidad, 0)

  return {
    pedidoNo: pedidoMatch ? pedidoMatch[1] : null,
    fecha,
    marca: marcaMatch ? marcaMatch[1].trim() : null,
    cantidadProductos: productosUnicos.length,
    cantidadTotal,
    productos: productosUnicos,
  }
}

function construirNombreA(lineas: string[], inicio: number): string {
  const partes: string[] = []
  for (let j = inicio; j < Math.min(inicio + 10, lineas.length); j++) {
    const l = lineas[j]
    if (/^\d+%$|^[\d,]+\.\d+$|^\d{8}$|^Caj XBX$|^C\d{4,5}/.test(l)) break
    if (l && l !== '-') partes.push(l)
  }
  return partes.join(' ')
}

function buscarCantidadA(lineas: string[], desde: number): number {
  for (let k = desde; k < Math.min(desde + 20, lineas.length - 1); k++) {
    if (lineas[k] === 'Caj XBX') {
      const sig = lineas[k + 1]
      if (sig && /^\d+$/.test(sig)) return parseInt(sig)
    }
  }
  return 1
}

// formato JUMEX: "Folio NNNN" + unidad XBX
function parseJumex(texto: string): FacturaParseada {
  const pedidoMatch = texto.match(/Folio[\s\n]*(\d+)/i)
  const fecha = extraerFechaISO(texto)

  const lineas = texto.split('\n')
  let cantidadProductos = 0
  let cantidadTotal = 0

  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].trim()
    if (/^\d{12,13}$/.test(l)) cantidadProductos++
    if (/^\d+(\.\d+)?$/.test(l)) {
      const sig = lineas[i + 1]?.trim()
      if (sig && /^\d{8}$/.test(sig)) cantidadTotal += parseFloat(l)
    }
  }

  const productos: FacturaProducto[] = []
  const regex =
    /^([^\n]+)\n\s*\n\s*XBX\s*\n\s*\d+\s*\n\s*\n\s*(\d+\.?\d*)\s*\n\s*\d+\s*\n\s*\n\s*[\d,]+\.?\d*\s*\n\s*\n\s*[\d,]+\.?\d*\s*\n\s*(\d+)/gm

  let m: RegExpExecArray | null
  while ((m = regex.exec(texto)) !== null) {
    productos.push({
      codigo: m[3],
      nombre: m[1]?.trim() ?? null,
      cantidad: parseInt(m[2]) || 0,
      marca: 'JUMEX',
    })
  }

  return {
    pedidoNo: pedidoMatch ? pedidoMatch[1] : null,
    fecha,
    marca: 'JUMEX',
    cantidadProductos: cantidadProductos || productos.length,
    cantidadTotal: cantidadTotal || productos.reduce((s, p) => s + p.cantidad, 0),
    productos,
  }
}

// formato Con Alimentos S.A. de C.V.
function parseConAlimentos(texto: string): FacturaParseada {
  const pedidoMatch = texto.match(/\n\s*(\d{10})\s*\n/)
  const fecha = extraerFechaISO(texto)

  const lineas = texto.split('\n')
  let cantidadProductos = 0
  let cantidadTotal = 0

  for (const linea of lineas) {
    if (/XBX/i.test(linea)) cantidadProductos++
    // acumular cantidades con unidad CJ (corrige bug original: solo tomaba el último)
    const cjMatch = linea.match(/(\d+)\s*CJ\b/i)
    if (cjMatch) cantidadTotal += parseInt(cjMatch[1])
  }

  const productos: FacturaProducto[] = []
  const regex = /\n(\d{3,4})\n\s*(\d{10,13})\n\s*(\d{8,10})\n([\s\S]+?)\n\s*XBX\n\s*(\d+)\s*CJ/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(texto)) !== null) {
    productos.push({
      codigo: m[1],
      nombre: m[4]?.trim() ?? null,
      cantidad: parseInt(m[5]) || 0,
      marca: 'CON ALIMENTOS',
    })
  }

  return {
    pedidoNo: pedidoMatch ? pedidoMatch[1] : null,
    fecha,
    marca: 'CON ALIMENTOS',
    cantidadProductos: cantidadProductos || productos.length,
    cantidadTotal,
    productos,
  }
}

// formato La Costeña
function parseLaCostena(texto: string): FacturaParseada {
  const pedidoMatch = texto.match(/\n\s*(\d{10})\s*\n/)
  const fecha = extraerFechaISO(texto)

  const totalMatch = texto.match(/TOTALES\s*\n\s*([\d,]+)/i)
  const cantidadTotal = totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : 0

  const lineas = texto.split('\n')
  let cantidadProductos = 0
  for (const l of lineas) {
    if (/^XBX/.test(l.trim())) cantidadProductos++
  }

  const productos: FacturaProducto[] = []
  const regex =
    /\n(\d{3,4})\n\s*(\d{10,13})\n\s*(\d{8,10})\n\s*(.+)\n\s*(.+)\n\s*(\d{1,5})/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(texto)) !== null) {
    productos.push({
      codigo: m[1],
      nombre: m[4]?.trim() ?? null,
      cantidad: parseInt(m[6]) || 0,
      marca: 'LA COSTEÑA',
    })
  }

  return {
    pedidoNo: pedidoMatch ? pedidoMatch[1] : null,
    fecha,
    marca: 'LA COSTEÑA',
    cantidadProductos: cantidadProductos || productos.length,
    cantidadTotal,
    productos,
  }
}
