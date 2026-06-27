import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import styled from 'styled-components'
import { useMarcas } from '@/hooks/useProductos'
import { useInsertarRack, useEditarRack } from '@/hooks/useRacks'
import type { Rack, RackFormValues } from '@/types/racks'
import { FloatingInput, FloatingSelect } from '@/components/atoms/FloatingInput'

interface Props {
  rack?: Rack
  onClose: () => void
}

export function FormRack({ rack, onClose }: Props) {
  const { t } = useTranslation()
  const esEdicion = rack !== undefined
  const { data: marcas = [] } = useMarcas()

  const { mutate: insertar, isPending: insertando } = useInsertarRack(onClose)
  const { mutate: editar, isPending: editando } = useEditarRack(onClose)
  const isPending = insertando || editando

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RackFormValues>()

  useEffect(() => {
    if (rack) {
      reset({
        codigo_rack: rack.codigo_rack,
        nivel: rack.nivel,
        lado: rack.lado,
        posicion: rack.posicion,
        marca_id: rack.marca_id ? String(rack.marca_id) : '',
      })
    }
  }, [rack, reset])

  function onSubmit(values: RackFormValues) {
    if (esEdicion) {
      editar({ id: rack!.id, values })
    } else {
      insertar(values)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{esEdicion ? t('racks.editar') : t('racks.nuevo')}</h2>
          <CloseBtn onClick={onClose} type="button">
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Fields>
            <FloatingInput
              label={`${t('racks.codigo')} *`}
              {...register('codigo_rack', { required: t('errores.requerido') })}
              disabled={isPending}
              style={{ textTransform: 'uppercase' }}
              error={errors.codigo_rack?.message}
            />

            <TwoCol>
              <FloatingInput
                label={`${t('racks.nivel')} *`}
                {...register('nivel', { required: t('errores.requerido') })}
                disabled={isPending}
                error={errors.nivel?.message}
              />
              <FloatingInput
                label={t('racks.lado')}
                type="number"
                min="0"
                {...register('lado')}
                disabled={isPending}
              />
            </TwoCol>

            <TwoCol>
              <FloatingInput
                label={t('racks.posicion')}
                type="number"
                min="0"
                {...register('posicion')}
                disabled={isPending}
              />
              <FloatingSelect
                label={t('racks.marca')}
                {...register('marca_id')}
                disabled={isPending}
              >
                <option value="">— {t('racks.marca')} —</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </FloatingSelect>
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
  transition: color 0.15s;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
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
