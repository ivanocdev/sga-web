import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FiX, FiUploadCloud, FiFile, FiLoader } from 'react-icons/fi'
import Swal from 'sweetalert2'
import styled, { keyframes } from 'styled-components'
import {
  uploadFactura,
  insertarDevolucion,
  insertarProductosVenta,
  validarProductos,
  insertarEnPiso,
} from '@/services/ventasService'
import { parsearPdf } from '@/utils/parsearPdf'
import { parsearExcel } from '@/utils/parsearExcel'
import type { FacturaParseada, UploadType } from '@/types/ventas'
import { useMarcas } from '@/hooks/useProductos'

interface Props {
  onClose: () => void
}

const MIME_PDF = 'application/pdf'
const MIME_EXCEL_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
const MIME_EXCEL_XLS = 'application/vnd.ms-excel'

export function FormDevolucion({ onClose }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const { data: marcas = [] } = useMarcas()

  const [uploadType, setUploadType] = useState<UploadType>('pdf')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [parsando, setParsando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const parsedRef = useRef<FacturaParseada | null>(null)

  async function manejarArchivo(file: File) {
    const valido =
      file.type === MIME_PDF ||
      file.type === MIME_EXCEL_XLSX ||
      file.type === MIME_EXCEL_XLS
    if (!valido) {
      Swal.fire({ icon: 'error', title: t('errores.archivo_invalido'), text: 'Solo PDF o Excel.' })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: t('errores.archivo_grande') })
      return
    }

    setArchivo(file)
    parsedRef.current = null
    setParsando(true)

    try {
      const datos =
        file.type === MIME_PDF
          ? await parsearPdf(file)
          : await parsearExcel(file)

      if (!datos || datos.productos.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin productos',
          text: 'No se encontraron productos válidos en el archivo.',
        })
        setArchivo(null)
        return
      }

      parsedRef.current = datos
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error al procesar el archivo', text: (err as Error).message })
      setArchivo(null)
    } finally {
      setParsando(false)
    }
  }

  async function procesarDevolucion() {
    const datos = parsedRef.current
    if (!datos || datos.productos.length === 0 || !archivo) {
      Swal.fire({ icon: 'warning', title: 'Sube un archivo primero.' })
      return
    }

    // validar qué productos existen en la DB antes de insertar
    const noEncontrados = await validarProductos(datos.productos)

    let productosAInsertar = datos.productos

    if (noEncontrados.length > 0) {
      const { isConfirmed } = await Swal.fire({
        title: '¿Continuar con advertencias?',
        html: `Los siguientes códigos no se encontraron en almacén:<br/>
          <strong>${noEncontrados.join(', ')}</strong><br/>
          Se ignorarán. ¿Continuar con los demás?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ignorar y continuar',
        cancelButtonText: t('common.cancelar'),
      })

      if (!isConfirmed) return

      productosAInsertar = datos.productos.filter(
        p => !noEncontrados.includes(p.codigo)
      )

      if (productosAInsertar.length === 0) {
        Swal.fire({ icon: 'info', title: 'Sin productos válidos para procesar.' })
        return
      }
    }

    setEnviando(true)
    try {
      // subir el archivo y detectar marca principal por los productos
      const facturaPath = await uploadFactura(archivo)

      // detectar marca predominante dinámicamente
      const marcaId = detectarMarcaPrincipal(datos.productos, marcas)

      const values = {
        codigo: datos.pedidoNo ?? String(Date.now()),
        marca_id: marcaId ? String(marcaId) : '',
        fecha: datos.fecha ?? new Date().toISOString().split('T')[0],
        cantidad_productos: String(productosAInsertar.length),
        cantidad_total: String(productosAInsertar.reduce((s, p) => s + p.cantidad, 0)),
      }

      const devolucionId = await insertarDevolucion(values, facturaPath)

      // registrar productos en el detalle de la devolución
      await insertarProductosVenta(devolucionId, productosAInsertar)

      // devolver los productos al inventario de piso
      await insertarEnPiso(productosAInsertar)

      qc.invalidateQueries({ queryKey: ['ventas'] })
      qc.invalidateQueries({ queryKey: ['productos'] })

      Swal.fire({ icon: 'success', title: '¡Devolución registrada!', timer: 1800, showConfirmButton: false })
      onClose()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: (err as Error).message })
    } finally {
      setEnviando(false)
    }
  }

  const productosCount = parsedRef.current?.productos.length ?? 0

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{t('ventas.devolucion')}</h2>
          <CloseBtn onClick={onClose} type="button"><FiX size={18} /></CloseBtn>
        </ModalHeader>

        <Body>
          <TypeSelector>
            <TypeBtn
              type="button"
              $activo={uploadType === 'pdf'}
              onClick={() => { setUploadType('pdf'); setArchivo(null); parsedRef.current = null }}
            >
              {t('ventas.tipo_pdf')}
            </TypeBtn>
            <TypeBtn
              type="button"
              $activo={uploadType === 'excel'}
              $excel
              onClick={() => { setUploadType('excel'); setArchivo(null); parsedRef.current = null }}
            >
              {t('ventas.tipo_excel')}
            </TypeBtn>
          </TypeSelector>

          <DropZone
            $activo={arrastrando}
            onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={e => {
              e.preventDefault()
              setArrastrando(false)
              const f = e.dataTransfer.files[0]
              if (f) manejarArchivo(f)
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={uploadType === 'pdf' ? '.pdf' : '.xlsx,.xls'}
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) manejarArchivo(f)
              }}
            />

            {parsando ? (
              <DropHint>
                <SpinIcon><FiLoader size={22} /></SpinIcon>
                <span>Analizando archivo...</span>
              </DropHint>
            ) : archivo ? (
              <ArchivoInfo>
                <FiFile size={20} />
                <span>{archivo.name}</span>
                {productosCount > 0 && (
                  <Badge>{productosCount} productos</Badge>
                )}
                <RemoveBtn
                  type="button"
                  onClick={e => {
                    e.stopPropagation()
                    setArchivo(null)
                    parsedRef.current = null
                  }}
                >
                  <FiX size={14} />
                </RemoveBtn>
              </ArchivoInfo>
            ) : (
              <DropHint>
                <FiUploadCloud size={24} />
                <span>{t('common.cargar')}</span>
                <small>{uploadType === 'pdf' ? 'PDF' : 'Excel'} — máx 10 MB</small>
              </DropHint>
            )}
          </DropZone>
        </Body>

        <ModalFooter>
          <CancelBtn type="button" onClick={onClose} disabled={enviando}>
            {t('common.cancelar')}
          </CancelBtn>
          <SaveBtn
            type="button"
            onClick={procesarDevolucion}
            disabled={!archivo || !productosCount || parsando || enviando}
          >
            {enviando ? t('common.cargando') : 'Procesar devolución'}
          </SaveBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  )
}

// detecta la marca con más cantidad de productos para asignarla a la devolución
function detectarMarcaPrincipal(
  productos: FacturaParseada['productos'],
  marcas: { id: number; nombre: string }[]
): number | null {
  const conteo: Record<string, number> = {}
  for (const p of productos) {
    if (!p.marca) continue
    const key = p.marca.toUpperCase()
    conteo[key] = (conteo[key] ?? 0) + (p.cantidad || 1)
  }

  let marcaNombre: string | null = null
  let maxCantidad = 0
  for (const [nombre, cantidad] of Object.entries(conteo)) {
    if (cantidad > maxCantidad) { maxCantidad = cantidad; marcaNombre = nombre }
  }

  if (!marcaNombre) return null
  const encontrada = marcas.find(m => m.nombre.toUpperCase() === marcaNombre)
  return encontrada?.id ?? null
}

// --- estilos ---

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  h2 { font-size: 1rem; font-weight: 600; color: ${({ theme }) => theme.text}; margin: 0; }
`

const CloseBtn = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex; padding: 4px; border-radius: 6px;
  transition: color 0.15s;
  &:hover { color: ${({ theme }) => theme.text}; }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`

const TypeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`

const TypeBtn = styled.button<{ $activo: boolean; $excel?: boolean }>`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ $activo, $excel, theme }) =>
    $activo ? ($excel ? '#217346' : theme.primary) : theme.border};
  background: ${({ $activo, $excel, theme }) =>
    $activo ? ($excel ? '#217346' : theme.primary) : 'transparent'};
  color: ${({ $activo, theme }) => ($activo ? '#fff' : theme.text)};
  transition: all 0.15s;
`

const DropZone = styled.div<{ $activo: boolean }>`
  border: 2px dashed ${({ $activo, theme }) => ($activo ? theme.primary : theme.border)};
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $activo, theme }) => ($activo ? `${theme.primary}0a` : theme.bg)};
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.primary}; }
`

const DropHint = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
  small { font-size: 0.75rem; }
`

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`
const SpinIcon = styled.span`
  display: inline-flex;
  animation: ${spin} 0.8s linear infinite;
  color: ${({ theme }) => theme.primary};
`

const ArchivoInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
  span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`

const Badge = styled.span`
  background: ${({ theme }) => `${theme.success}20`};
  color: ${({ theme }) => theme.success};
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
`

const RemoveBtn = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.danger};
  display: flex; padding: 2px; border-radius: 4px; flex-shrink: 0;
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`

const CancelBtn = styled.button`
  height: 36px; padding: 0 1rem; border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent; color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem; cursor: pointer; transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.surfaceHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SaveBtn = styled.button`
  height: 36px; padding: 0 1.25rem; border-radius: 8px; border: none;
  background: ${({ theme }) => theme.danger};
  color: #fff; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
  &:hover:not(:disabled) { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`
