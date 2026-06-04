import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import styled from 'styled-components'
import { useMarcas } from '@/hooks/useProductos'
import { useInsertarRack, useEditarRack } from '@/hooks/useRacks'
import type { Rack, RackFormValues } from '@/types/racks'

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
            <Field>
              <label>{t('racks.codigo')} *</label>
              <input
                {...register('codigo_rack', { required: t('errores.requerido') })}
                placeholder="ej. A-01"
                disabled={isPending}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.codigo_rack && <ErrorMsg>{errors.codigo_rack.message}</ErrorMsg>}
            </Field>

            <TwoCol>
              <Field>
                <label>{t('racks.nivel')} *</label>
                <input
                  {...register('nivel', { required: t('errores.requerido') })}
                  placeholder="ej. A"
                  disabled={isPending}
                />
                {errors.nivel && <ErrorMsg>{errors.nivel.message}</ErrorMsg>}
              </Field>

              <Field>
                <label>{t('racks.lado')}</label>
                <input
                  type="number"
                  min="0"
                  {...register('lado')}
                  placeholder="ej. 1"
                  disabled={isPending}
                />
              </Field>
            </TwoCol>

            <TwoCol>
              <Field>
                <label>{t('racks.posicion')}</label>
                <input
                  type="number"
                  min="0"
                  {...register('posicion')}
                  placeholder="ej. 1"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <label>{t('racks.marca')}</label>
                <select {...register('marca_id')} disabled={isPending}>
                  <option value="">— {t('racks.marca')} —</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </Field>
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

// --- estilos (mismo patrón que FormProducto) ---

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
  gap: 1rem;
  padding: 1.5rem;
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

  input,
  select {
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

    &:focus {
      border-color: ${({ theme }) => theme.inputFocus};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
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
