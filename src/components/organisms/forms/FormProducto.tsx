import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import styled from 'styled-components'
import { fetchProductoEditable } from '@/services/productosService'
import { useMarcas, useInsertarProducto, useEditarProducto } from '@/hooks/useProductos'
import { reglas } from '@/utils/validaciones'
import type { ProductoFormValues } from '@/types/productos'
import { FloatingInput, FloatingSelect } from '@/components/atoms/FloatingInput'

interface Props {
  productoId?: number
  onClose: () => void
}

export function FormProducto({ productoId, onClose }: Props) {
  const { t } = useTranslation()
  const esEdicion = productoId !== undefined
  const { data: marcas = [] } = useMarcas()

  // carga los valores raw de la DB solo al editar
  // (el SELECT de lista omite la columna "cajas" para evitar colisión con la relación)
  const { data: editable, isLoading: cargandoEditable } = useQuery({
    queryKey: ['producto-editable', productoId],
    queryFn: () => fetchProductoEditable(productoId!),
    enabled: esEdicion,
  })

  const { mutate: insertar, isPending: insertando } = useInsertarProducto(onClose)
  const { mutate: editar, isPending: editando } = useEditarProducto(onClose)
  const isPending = insertando || editando

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductoFormValues>()

  useEffect(() => {
    if (editable) {
      reset({
        codigo: String(editable.codigo),
        nombre: editable.nombre,
        marca_id: editable.marca_id ? String(editable.marca_id) : '',
        cajas_por_tarima: editable.cajas_por_tarima ? String(editable.cajas_por_tarima) : '',
        cantidad: String(editable.cantidad),
      })
    }
  }, [editable, reset])

  function onSubmit(values: ProductoFormValues) {
    if (esEdicion) {
      editar({ id: productoId!, values })
    } else {
      insertar(values)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{esEdicion ? t('productos.editar') : t('productos.agregar')}</h2>
          <CloseBtn onClick={onClose} type="button">
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        {esEdicion && cargandoEditable ? (
          <Loading>{t('common.cargando')}</Loading>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Fields>
              <FloatingInput
                label="Código *"
                {...register('codigo', { required: t('errores.requerido'), ...reglas.codigoNumerico })}
                disabled={isPending}
                error={errors.codigo?.message}
              />

              <FloatingInput
                label={`${t('productos.nombre')} *`}
                {...register('nombre', { required: t('errores.requerido'), ...reglas.nombre })}
                disabled={isPending}
                error={errors.nombre?.message}
              />

              <FloatingSelect
                label={t('productos.marca')}
                {...register('marca_id')}
                disabled={isPending}
              >
                <option value="">{t('productos.todas_marcas')}</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </FloatingSelect>

              <TwoCol>
                <FloatingInput
                  label="Cajas / tarima"
                  type="number"
                  min="0"
                  {...register('cajas_por_tarima')}
                  disabled={isPending}
                />
                <FloatingInput
                  label="Cantidad"
                  type="number"
                  min="0"
                  {...register('cantidad')}
                  disabled={isPending}
                />
              </TwoCol>
            </Fields>

            <ModalFooter>
              <CancelBtn type="button" onClick={onClose} disabled={isPending}>
                {t('common.cancelar')}
              </CancelBtn>
              <SaveBtn type="submit" disabled={isPending}>
                {isPending ? t('common.cargando') : t('common.guardar')}
              </SaveBtn>
            </ModalFooter>
          </form>
        )}
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
  max-width: 460px;
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
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`

const Loading = styled.p`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
`

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
