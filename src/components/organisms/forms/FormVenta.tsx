import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { FiX, FiUploadCloud, FiFile, FiLoader } from 'react-icons/fi'
import Swal from 'sweetalert2'
import styled, { keyframes } from 'styled-components'
import { useMarcas } from '@/hooks/useProductos'
import { useEditarVenta } from '@/hooks/useVentas'
import { uploadFactura, insertarVenta, insertarProductosVenta } from '@/services/ventasService'
import { parsearPdf } from '@/utils/parsearPdf'
import type { Venta, VentaFormValues, UploadType, FacturaParseada } from '@/types/ventas'

interface Props {
  ventaEditar?: Venta
  onClose: () => void
}

const MIME_VALIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]

export function FormVenta({ ventaEditar, onClose }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const esEdicion = !!ventaEditar
  const { data: marcas = [] } = useMarcas()

  const [uploadType, setUploadType] = useState<UploadType>('pdf')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [parsando, setParsando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [arrastrando, setArrastrando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // productos extraídos del parser — se insertan en detalle_ventas al confirmar
  const productosParsed = useRef<FacturaParseada['productos']>([])

  const { mutate: editar, isPending: editando } = useEditarVenta(onClose)
  const isPending = editando || enviando

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VentaFormValues>()

  useEffect(() => {
    if (ventaEditar) {
      reset({
        codigo: ventaEditar.codigo ?? '',
        marca_id: ventaEditar.marca_id ? String(ventaEditar.marca_id) : '',
        cantidad_productos: ventaEditar.cantidad_productos ? String(ventaEditar.cantidad_productos) : '',
        cantidad_total: ventaEditar.cantidad_total ? String(ventaEditar.cantidad_total) : '',
        fecha: ventaEditar.fecha ? ventaEditar.fecha.split('T')[0] : '',
      })
    }
  }, [ventaEditar, reset])

  function autoFill(datos: FacturaParseada) {
    if (datos.pedidoNo) setValue('codigo', datos.pedidoNo)
    if (datos.fecha) setValue('fecha', datos.fecha)
    if (datos.cantidadProductos !== null)
      setValue('cantidad_productos', String(datos.cantidadProductos))
    if (datos.cantidadTotal !== null)
      setValue('cantidad_total', String(datos.cantidadTotal))
    if (datos.marca && marcas.length > 0) {
      const encontrada = marcas.find(m =>
        m.nombre.toLowerCase().includes(datos.marca!.toLowerCase())
      )
      if (encontrada) setValue('marca_id', String(encontrada.id))
    }
    productosParsed.current = datos.productos
  }

  function validarArchivo(file: File): boolean {
    if (!MIME_VALIDOS.includes(file.type)) {
      Swal.fire({ icon: 'error', title: t('errores.archivo_invalido'), text: 'Solo PDF o Excel.' })
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: t('errores.archivo_grande') })
      return false
    }
    return true
  }

  async function manejarArchivo(file: File) {
    if (!validarArchivo(file)) return
    setArchivo(file)
    productosParsed.current = []

    if (uploadType === 'pdf' && file.type === 'application/pdf') {
      setParsando(true)
      try {
        const datos = await parsearPdf(file)
        if (datos) autoFill(datos)
      } catch (err) {
        console.error('Error al parsear PDF:', err)
      } finally {
        setParsando(false)
      }
    }
    // Excel parser se conecta en el siguiente commit
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setArrastrando(false)
    const file = e.dataTransfer.files[0]
    if (file) manejarArchivo(file)
  }

  async function onSubmit(values: VentaFormValues) {
    if (esEdicion) {
      editar({ id: ventaEditar!.id, values })
      return
    }

    setEnviando(true)
    try {
      // 1. subir archivo si existe
      let facturaPath: string | null = null
      if (archivo) {
        facturaPath = await uploadFactura(archivo)
      }

      // 2. insertar venta → obtener el id
      const ventaId = await insertarVenta(values, facturaPath)

      // 3. insertar productos extraídos del parser (si los hay)
      let resultado: { insertados: number; omitidos: number } | null = null
      if (productosParsed.current.length > 0) {
        resultado = await insertarProductosVenta(ventaId, productosParsed.current)
      }

      qc.invalidateQueries({ queryKey: ['ventas'] })

      const extra = resultado?.omitidos
        ? ` (${resultado.omitidos} ${t('ventas.omitidos')})`
        : ''
      Swal.fire({
        icon: 'success',
        title: `¡Venta registrada!${extra}`,
        timer: 2000,
        showConfirmButton: false,
      })
      onClose()
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: (err as Error).message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{esEdicion ? 'Editar venta' : t('ventas.agregar')}</h2>
          <CloseBtn onClick={onClose} type="button">
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Body>
            {!esEdicion && (
              <>
                <TypeSelector>
                  <TypeBtn
                    type="button"
                    $activo={uploadType === 'pdf'}
                    onClick={() => { setUploadType('pdf'); setArchivo(null); productosParsed.current = [] }}
                  >
                    {t('ventas.tipo_pdf')}
                  </TypeBtn>
                  <TypeBtn
                    type="button"
                    $activo={uploadType === 'excel'}
                    $excel
                    onClick={() => { setUploadType('excel'); setArchivo(null); productosParsed.current = [] }}
                  >
                    {t('ventas.tipo_excel')}
                  </TypeBtn>
                </TypeSelector>

                <DropZone
                  $activo={arrastrando}
                  onDragOver={e => { e.preventDefault(); setArrastrando(true) }}
                  onDragLeave={() => setArrastrando(false)}
                  onDrop={onDrop}
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
                      {productosParsed.current.length > 0 && (
                        <Badge>{productosParsed.current.length} productos</Badge>
                      )}
                      <RemoveBtn
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setArchivo(null)
                          productosParsed.current = []
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
              </>
            )}

            <Fields>
              <Field>
                <label>{t('ventas.codigo')} *</label>
                <input
                  {...register('codigo', { required: t('errores.requerido') })}
                  placeholder="ej. PED-2024-001"
                  disabled={isPending}
                />
                {errors.codigo && <ErrorMsg>{errors.codigo.message}</ErrorMsg>}
              </Field>

              <Field>
                <label>{t('ventas.marca')}</label>
                <select {...register('marca_id')} disabled={isPending}>
                  <option value="">{t('productos.todas_marcas')}</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </Field>

              <Field>
                <label>{t('ventas.fecha')}</label>
                <input type="date" {...register('fecha')} disabled={isPending} />
              </Field>

              <TwoCol>
                <Field>
                  <label>{t('ventas.cantidad_productos')}</label>
                  <input
                    type="number"
                    min="0"
                    {...register('cantidad_productos')}
                    placeholder="0"
                    disabled={isPending}
                  />
                </Field>
                <Field>
                  <label>{t('ventas.cantidad_total')}</label>
                  <input
                    type="number"
                    min="0"
                    {...register('cantidad_total')}
                    placeholder="0"
                    disabled={isPending}
                  />
                </Field>
              </TwoCol>
            </Fields>
          </Body>

          <ModalFooter>
            <CancelBtn type="button" onClick={onClose} disabled={isPending}>
              {t('common.cancelar')}
            </CancelBtn>
            <SaveBtn type="submit" disabled={isPending}>
              {isPending ? t('common.cargando') : t('common.guardar')}
            </SaveBtn>
          </ModalFooter>
        </form>
      </Modal>
    </Overlay>
  )
}

// --- estilos ---

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
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background: ${({ theme }) => theme.surface};
  z-index: 1;

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
  padding: 1.25rem;
  text-align: center;
  cursor: pointer;
  background: ${({ $activo, theme }) => ($activo ? `${theme.primary}0a` : theme.bg)};
  transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => `${theme.primary}08`};
  }
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

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

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
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.danger};
  display: flex;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
`

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  flex: 1;

  label {
    font-size: 0.8rem;
    font-weight: 500;
    color: ${({ theme }) => theme.textMuted};
  }

  input, select {
    height: 38px;
    padding: 0 0.75rem;
    border: 1px solid ${({ theme }) => theme.inputBorder};
    border-radius: 8px;
    background: ${({ theme }) => theme.inputBg};
    color: ${({ theme }) => theme.text};
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    &:focus { border-color: ${({ theme }) => theme.inputFocus}; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`

const ErrorMsg = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.danger};
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
  transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.surfaceHover}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SaveBtn = styled.button`
  height: 36px;
  padding: 0 1.25rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
