import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import styled from 'styled-components'
import { useInsertarRegistroCaja, useEditarRegistroCaja } from '@/hooks/useCajas'
import { useRacksLibres } from '@/hooks/useRacks'
import type { RegistroCaja, RegistroCajaFormValues, TipoRegistro } from '@/types/cajas'
import { FloatingInput, FloatingSelect } from '@/components/atoms/FloatingInput'

interface Props {
  productoId: number
  registro?: RegistroCaja
  onClose: () => void
}

export function FormCaja({ productoId, registro, onClose }: Props) {
  const { t } = useTranslation()
  const esEdicion = registro !== undefined
  const [tipo, setTipo] = useState<TipoRegistro>(registro?.tipo ?? 'caja')

  // al editar, incluir el rack actual en la lista de opciones aunque esté ocupado
  const rack_id_actual = registro?.tipo === 'caja' ? (registro.rack_id ?? undefined) : undefined
  const { data: racks = [] } = useRacksLibres(rack_id_actual)

  const { mutate: insertar, isPending: insertando } = useInsertarRegistroCaja(productoId, onClose)
  const { mutate: editar, isPending: editando } = useEditarRegistroCaja(productoId, onClose)
  const isPending = insertando || editando

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistroCajaFormValues>()

  useEffect(() => {
    if (registro) {
      setTipo(registro.tipo)
      reset({
        cantidad: String(registro.cantidad),
        fecha_caducidad: registro.fecha_caducidad ?? '',
        rack_id: registro.rack_id ? String(registro.rack_id) : '',
        codigo_barras: registro.codigo_barras ?? '',
      })
    } else {
      reset({ cantidad: '', fecha_caducidad: '', rack_id: '', codigo_barras: '' })
    }
  }, [registro, reset])

  function onSubmit(values: RegistroCajaFormValues) {
    if (esEdicion) {
      editar({ values, registro: registro! })
    } else {
      insertar({ values, tipo })
    }
  }

  const tipoLabel = {
    caja: t('cajas.tipo_caja'),
    suelto: t('cajas.tipo_suelto'),
    piso: t('cajas.tipo_piso'),
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{esEdicion ? t('cajas.editar') : t('cajas.agregar_entrada')}</h2>
          <CloseBtn onClick={onClose} type="button">
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Fields>
            {/* selector de tipo solo en nuevo registro */}
            {!esEdicion && (
              <TipoSection>
                <TipoLabel>{t('cajas.tipo')}</TipoLabel>
                <TipoSelector>
                  {(['caja', 'suelto', 'piso'] as TipoRegistro[]).map(t_ => (
                    <TipoBtn
                      key={t_}
                      type="button"
                      $tipo={t_}
                      $activo={tipo === t_}
                      onClick={() => setTipo(t_)}
                      disabled={isPending}
                    >
                      {tipoLabel[t_]}
                    </TipoBtn>
                  ))}
                </TipoSelector>
              </TipoSection>
            )}

            <FloatingInput
              label={`${t('cajas.cantidad')} *`}
              type="number"
              min="1"
              {...register('cantidad', { required: t('errores.requerido') })}
              disabled={isPending}
              error={errors.cantidad?.message}
            />

            <FloatingInput
              label={t('cajas.fecha_caducidad')}
              type="date"
              {...register('fecha_caducidad')}
              disabled={isPending}
            />

            {/* rack selector solo para tipo caja */}
            {(tipo === 'caja' || (esEdicion && registro?.tipo === 'caja')) && (
              <FloatingSelect
                label="Rack"
                {...register('rack_id')}
                disabled={isPending}
              >
                <option value="">— Sin rack —</option>
                {racks.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.codigo_rack}
                    {r.nivel ? ` — Nivel ${r.nivel}` : ''}
                    {r.lado ? ` L${r.lado}` : ''}
                    {r.posicion ? ` P${r.posicion}` : ''}
                  </option>
                ))}
              </FloatingSelect>
            )}

            <FloatingInput
              label={t('cajas.codigo_barras')}
              {...register('codigo_barras')}
              disabled={isPending}
            />
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

const TipoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TipoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.inputFocus};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const TipoSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`

const TipoBtn = styled.button<{ $tipo: TipoRegistro; $activo: boolean }>`
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid
    ${({ $tipo, $activo, theme }) => {
      if (!$activo) return theme.border
      if ($tipo === 'caja') return theme.primary
      if ($tipo === 'suelto') return theme.warning
      return theme.danger
    }};
  background: ${({ $tipo, $activo, theme }) => {
    if (!$activo) return 'transparent'
    if ($tipo === 'caja') return `${theme.primary}18`
    if ($tipo === 'suelto') return `${theme.warning}18`
    return `${theme.danger}18`
  }};
  color: ${({ $tipo, $activo, theme }) => {
    if (!$activo) return theme.textMuted
    if ($tipo === 'caja') return theme.primary
    if ($tipo === 'suelto') return theme.warning
    return theme.danger
  }};

  &:hover:not(:disabled) {
    border-color: ${({ $tipo, theme }) => {
      if ($tipo === 'caja') return theme.primary
      if ($tipo === 'suelto') return theme.warning
      return theme.danger
    }};
  }
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
