import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { FiX } from 'react-icons/fi'
import styled from 'styled-components'
import { useAsignarEquipo, useEquipoVenta, useAyudantesVenta } from '@/hooks/useVentas'
import { fetchUsuariosActivos } from '@/services/usuariosService'

interface Props {
  ventaId: number
  onClose: () => void
}

export function FormAsignarEquipo({ ventaId, onClose }: Props) {
  const { t } = useTranslation()

  const { data: equipo } = useEquipoVenta(ventaId)
  const { data: ayudantesActuales = [] } = useAyudantesVenta(ventaId)
  const { data: usuarios = [], isLoading: cargandoUsuarios } = useQuery({
    queryKey: ['usuarios-activos'],
    queryFn: fetchUsuariosActivos,
    staleTime: 1000 * 60 * 5,
  })

  const [responsableId, setResponsableId] = useState<string>(
    equipo?.usuario ?? ''
  )
  const [ayudantesSeleccionados, setAyudantesSeleccionados] = useState<string[]>(
    ayudantesActuales.map(a => a.usuario_id)
  )

  const { mutate: asignar, isPending } = useAsignarEquipo(ventaId, onClose)

  // responsable no puede estar también en ayudantes
  const disponiblesParaAyudante = usuarios.filter(
    u => u.id !== responsableId && !ayudantesSeleccionados.includes(u.id)
  )

  function agregarAyudante(id: string) {
    if (id && !ayudantesSeleccionados.includes(id)) {
      setAyudantesSeleccionados(prev => [...prev, id])
    }
  }

  function removerAyudante(id: string) {
    setAyudantesSeleccionados(prev => prev.filter(a => a !== id))
  }

  function nombreUsuario(id: string): string {
    return usuarios.find(u => u.id === id)?.nombre ?? id
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!responsableId) return
    asignar({ responsableAuthId: responsableId, ayudantesIds: ayudantesSeleccionados })
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>{t('ventas.asignar_equipo')}</h2>
          <CloseBtn type="button" onClick={onClose}><FiX size={18} /></CloseBtn>
        </ModalHeader>

        {cargandoUsuarios ? (
          <Loading>{t('common.cargando')}</Loading>
        ) : (
          <form onSubmit={onSubmit}>
            <Body>
              <Seccion>
                <h3>{t('ventas.responsable')}</h3>
                <Select
                  value={responsableId}
                  onChange={e => {
                    const nuevoId = e.target.value
                    setResponsableId(nuevoId)
                    // si el nuevo responsable estaba como ayudante, quitarlo
                    setAyudantesSeleccionados(prev => prev.filter(a => a !== nuevoId))
                  }}
                  disabled={isPending}
                >
                  <option value="">Seleccione un responsable</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </Select>
              </Seccion>

              <Seccion>
                <h3>{t('ventas.ayudantes')}</h3>

                <Select
                  value=""
                  onChange={e => { agregarAyudante(e.target.value); e.currentTarget.value = '' }}
                  disabled={isPending || disponiblesParaAyudante.length === 0}
                >
                  <option value="">Agregar ayudante...</option>
                  {disponiblesParaAyudante.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </Select>

                <ChipList>
                  {ayudantesSeleccionados.length === 0 ? (
                    <Vacio>{t('ventas.sin_ayudantes')}</Vacio>
                  ) : (
                    ayudantesSeleccionados.map(id => (
                      <Chip key={id}>
                        <span>{nombreUsuario(id)}</span>
                        <ChipRemove
                          type="button"
                          onClick={() => removerAyudante(id)}
                          disabled={isPending}
                        >
                          <FiX size={12} />
                        </ChipRemove>
                      </Chip>
                    ))
                  )}
                </ChipList>
              </Seccion>
            </Body>

            <ModalFooter>
              <CancelBtn type="button" onClick={onClose} disabled={isPending}>
                {t('common.cancelar')}
              </CancelBtn>
              <SaveBtn type="submit" disabled={!responsableId || isPending}>
                {isPending ? t('common.cargando') : t('ventas.asignar_equipo')}
              </SaveBtn>
            </ModalFooter>
          </form>
        )}
      </Modal>
    </Overlay>
  )
}

// --- estilos ---

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  width: 100%; max-width: 440px;
  max-height: 90vh; overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  h2 { font-size: 1rem; font-weight: 600; color: ${({ theme }) => theme.text}; margin: 0; }
`

const CloseBtn = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex; padding: 4px; border-radius: 6px;
  &:hover { color: ${({ theme }) => theme.text}; }
`

const Loading = styled.p`
  padding: 2rem; text-align: center;
  color: ${({ theme }) => theme.textMuted}; font-size: 0.875rem;
`

const Body = styled.div`
  display: flex; flex-direction: column; gap: 1.25rem; padding: 1.5rem;
`

const Seccion = styled.div`
  display: flex; flex-direction: column; gap: 0.75rem;

  h3 {
    font-size: 0.8rem; font-weight: 600;
    color: ${({ theme }) => theme.textMuted};
    text-transform: uppercase; letter-spacing: 0.05em;
    margin: 0;
  }
`

const Select = styled.select`
  height: 38px; padding: 0 0.75rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem; width: 100%; outline: none;
  transition: border-color 0.15s;
  &:focus { border-color: ${({ theme }) => theme.inputFocus}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const ChipList = styled.div`
  display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 2rem;
`

const Chip = styled.div`
  display: flex; align-items: center; gap: 0.375rem;
  background: ${({ theme }) => `${theme.primary}18`};
  color: ${({ theme }) => theme.primary};
  padding: 0.25rem 0.5rem 0.25rem 0.75rem;
  border-radius: 999px; font-size: 0.8rem; font-weight: 500;
`

const ChipRemove = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.primary};
  display: flex; padding: 1px; border-radius: 50%;
  &:hover { background: ${({ theme }) => `${theme.primary}30`}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const Vacio = styled.p`
  font-size: 0.8rem; font-style: italic;
  color: ${({ theme }) => theme.textMuted}; margin: 0;
`

const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 0.75rem;
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
  background: ${({ theme }) => theme.primary};
  color: #fff; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: background 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
