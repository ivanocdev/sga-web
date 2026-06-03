import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useTranslation } from 'react-i18next'
import { FiUploadCloud, FiX, FiFile } from 'react-icons/fi'
import styled from 'styled-components'
import Swal from 'sweetalert2'
import { useQueryClient } from '@tanstack/react-query'
import { useMarcas } from '@/hooks/useProductos'
import { verificarCodigosExistentes, insertarProductosMasivo } from '@/services/productosService'

interface Props {
  onClose: () => void
}

// shape mínimo que esperamos de cada fila del Excel
interface FilaExcel {
  [key: string]: string | number | undefined
}

export function CargarProductosExcel({ onClose }: Props) {
  const { t } = useTranslation()
  const { data: marcas = [] } = useMarcas()
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  function leerCampo(fila: FilaExcel, ...claves: string[]): string {
    for (const k of claves) {
      const val = fila[k]
      if (val !== undefined && val !== '') return String(val).trim()
    }
    return ''
  }

  async function procesar() {
    if (!archivo) return
    setLoading(true)

    try {
      const buffer = await archivo.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const hoja = wb.Sheets[wb.SheetNames[0]]
      const filas = XLSX.utils.sheet_to_json<FilaExcel>(hoja, { defval: '' })

      // IDs de marcas por nombre — lookup dinámico, sin IDs hardcodeados
      const mapaIdMarca = new Map(
        marcas.map(m => [m.nombre.toLowerCase().trim(), m.id])
      )

      // acepta columnas en mayúsculas, minúsculas o con acento
      const productos = filas
        .map(fila => {
          const codigo = leerCampo(fila, 'codigo', 'Código', 'CODIGO', 'Codigo')
          const nombre = leerCampo(fila, 'nombre', 'Nombre', 'NOMBRE')
          const marcaNombre = leerCampo(fila, 'marca', 'Marca', 'MARCA').toLowerCase()
          const marca_id = mapaIdMarca.get(marcaNombre) ?? null
          return { codigo, nombre, marca_id }
        })
        .filter(p => p.codigo !== '' && p.nombre !== '')

      if (!productos.length) {
        Swal.fire({ icon: 'warning', title: 'Sin datos válidos', text: 'Revisa que el archivo tenga columnas: codigo, nombre, marca.' })
        return
      }

      const existentes = await verificarCodigosExistentes(
        productos.map(p => ({ codigo: p.codigo, marca_id: p.marca_id }))
      )

      const nuevos = productos.filter(
        p => !existentes.includes(`${p.codigo}-${p.marca_id}`)
      )

      if (!nuevos.length) {
        Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'Todos los códigos del archivo ya existen en el sistema.' })
        return
      }

      const insertados = await insertarProductosMasivo(nuevos)
      qc.invalidateQueries({ queryKey: ['productos'] })

      Swal.fire({
        icon: 'success',
        title: 'Importación completada',
        html: `<b>${insertados}</b> productos importados<br/><span style="color:#64748b">${productos.length - insertados} omitidos (ya existían)</span>`,
      })
      onClose()
    } catch (err) {
      console.error(err)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar el archivo.' })
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setArchivo(file)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Cargar productos desde Excel</h2>
          <CloseBtn type="button" onClick={onClose}>
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <Body>
          <DropZone
            $dragging={dragging}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {archivo ? (
              <>
                <FiFile size={28} />
                <p>{archivo.name}</p>
                <small>{(archivo.size / 1024).toFixed(1)} KB — clic para cambiar</small>
              </>
            ) : (
              <>
                <FiUploadCloud size={32} />
                <p>Arrastra un archivo o haz clic para seleccionar</p>
                <small>.xlsx · .xls</small>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={e => setArchivo(e.target.files?.[0] ?? null)}
            />
          </DropZone>

          <Hint>
            El archivo debe tener columnas: <b>codigo</b>, <b>nombre</b> y <b>marca</b> (nombre exacto como aparece en el sistema).
            Los códigos que ya existan se omiten automáticamente.
          </Hint>
        </Body>

        <ModalFooter>
          <CancelBtn type="button" onClick={onClose} disabled={loading}>
            {t('common.cancelar')}
          </CancelBtn>
          <ImportBtn onClick={procesar} disabled={!archivo || loading}>
            {loading ? t('common.cargando') : t('common.cargar')}
          </ImportBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  h2 {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin: 0;
  }
`

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  padding: 4px;
  border-radius: 6px;

  &:hover { color: ${({ theme }) => theme.text}; }
`

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const DropZone = styled.div<{ $dragging: boolean }>`
  border: 2px dashed ${({ $dragging, theme }) => ($dragging ? theme.primary : theme.border)};
  border-radius: 10px;
  padding: 2rem 1rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $dragging, theme }) => ($dragging ? theme.primaryLight : theme.bg)};
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  svg { color: ${({ theme }) => theme.textMuted}; }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text};
  }

  small {
    color: ${({ theme }) => theme.textMuted};
    font-size: 0.75rem;
  }

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primaryLight};
  }
`

const Hint = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.textMuted};
  margin: 0;
  line-height: 1.5;
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
`

const CancelBtn = styled.button`
  height: 36px;
  padding: 0 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
  cursor: pointer;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.surfaceHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const ImportBtn = styled.button`
  height: 36px;
  padding: 0 1.25rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.success};
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`
