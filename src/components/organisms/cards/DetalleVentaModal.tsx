import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiX, FiExternalLink } from 'react-icons/fi'
import { format } from 'date-fns'
import styled from 'styled-components'
import { bp } from '@/styles/breakpoints'
import { useDetalleVenta, useEquipoVenta, useAyudantesVenta } from '@/hooks/useVentas'
import type { Venta } from '@/types/ventas'

interface Props {
  venta: Venta
  onClose: () => void
}

export function DetalleVentaModal({ venta, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: detalle = [], isLoading } = useDetalleVenta(venta.id)
  const { data: equipo } = useEquipoVenta(venta.id)
  const { data: ayudantes = [] } = useAyudantesVenta(venta.id)

  const isDevolucion = venta.estado === 'Devolucion'

  function formatFecha(f: string | null) {
    if (!f) return '—'
    try { return format(new Date(f), 'dd/MM/yyyy') } catch { return f }
  }

  function irADetalle() {
    onClose()
    navigate(`/ventas/${venta.id}/productos`)
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <TituloGrupo>
            <h2>{venta.codigo}</h2>
            <EstadoBadge $devolucion={isDevolucion}>
              {isDevolucion ? t('ventas.devolucion_label') : t('ventas.normal')}
            </EstadoBadge>
          </TituloGrupo>
          <CloseBtn onClick={onClose}><FiX size={18} /></CloseBtn>
        </ModalHeader>

        <Body>
          {/* resumen de la venta */}
          <MetaGrid>
            <MetaItem>
              <span className="label">{t('ventas.fecha')}</span>
              <span className="value">{formatFecha(venta.fecha)}</span>
            </MetaItem>
            <MetaItem>
              <span className="label">{t('ventas.marca')}</span>
              <span className="value">{venta.marcas?.nombre ?? '—'}</span>
            </MetaItem>
            <MetaItem>
              <span className="label">{t('ventas.responsable')}</span>
              <span className="value">
                {isDevolucion
                  ? '—'
                  : (equipo?.usuarios?.nombre ?? t('ventas.sin_asignar'))}
              </span>
            </MetaItem>
            <MetaItem>
              <span className="label">{t('ventas.ayudantes')}</span>
              <span className="value">
                {ayudantes.length > 0
                  ? ayudantes.map(a => a.usuarios?.nombre ?? '?').join(', ')
                  : t('ventas.sin_ayudantes')}
              </span>
            </MetaItem>
          </MetaGrid>

          {/* stats */}
          <StatsRow>
            <Stat>
              <span className="num">{venta.cantidad_productos ?? 0}</span>
              <span className="label">{t('ventas.cantidad_productos')}</span>
            </Stat>
            <StatDivider />
            <Stat>
              <span className="num">{venta.cantidad_total ?? 0}</span>
              <span className="label">{t('ventas.cantidad_total')}</span>
            </Stat>
          </StatsRow>

          {/* tabla de productos */}
          <SeccionTitulo>{t('ventas.productos_venta')}</SeccionTitulo>

          {isLoading ? (
            <Cargando>{t('common.cargando')}</Cargando>
          ) : detalle.length === 0 ? (
            <Cargando>{t('ventas.sin_ventas')}</Cargando>
          ) : (
            <TablaWrapper>
              <Tabla>
                <thead>
                  <tr>
                    <Th>{t('ventas.codigo')}</Th>
                    <Th>{t('productos.nombre')}</Th>
                    <Th>{t('cajas.cantidad')}</Th>
                    <Th className="hide-sm">{t('cajas.fecha_caducidad')}</Th>
                    <Th className="hide-sm">{t('productos.ubicacion')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map(d => (
                    <Tr key={d.id}>
                      <Td>{d.productos?.codigo ?? '—'}</Td>
                      <Td>{d.productos?.nombre ?? '—'}</Td>
                      <Td>{d.cantidad}</Td>
                      <Td className="hide-sm">{formatFecha(d.fecha_caducidad)}</Td>
                      <Td className="hide-sm">{d.ubicacion ?? '—'}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Tabla>
            </TablaWrapper>
          )}
        </Body>

        <ModalFooter>
          <CancelBtn type="button" onClick={onClose}>
            {t('common.cerrar')}
          </CancelBtn>
          <DetalleBtn type="button" onClick={irADetalle}>
            <FiExternalLink size={14} />
            {t('ventas.detalle')}
          </DetalleBtn>
        </ModalFooter>
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
  width: 100%; max-width: 680px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
`

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`

const TituloGrupo = styled.div`
  display: flex; align-items: center; gap: 0.75rem;

  h2 { font-size: 1rem; font-weight: 600; color: ${({ theme }) => theme.text}; margin: 0; }
`

const EstadoBadge = styled.span<{ $devolucion: boolean }>`
  padding: 0.2rem 0.6rem;
  border-radius: 999px; font-size: 0.7rem; font-weight: 600;
  background: ${({ $devolucion, theme }) =>
    $devolucion ? `${theme.danger}20` : `${theme.success}20`};
  color: ${({ $devolucion, theme }) => ($devolucion ? theme.danger : theme.success)};
`

const CloseBtn = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex; padding: 4px; border-radius: 6px;
  &:hover { color: ${({ theme }) => theme.text}; }
`

const Body = styled.div`
  flex: 1; overflow-y: auto;
  display: flex; flex-direction: column; gap: 1.25rem;
  padding: 1.25rem 1.5rem;
`

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media ${bp.md} { grid-template-columns: repeat(4, 1fr); }
`

const MetaItem = styled.div`
  display: flex; flex-direction: column; gap: 0.2rem;

  .label {
    font-size: 0.7rem; font-weight: 500;
    color: ${({ theme }) => theme.textMuted};
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  .value { font-size: 0.875rem; color: ${({ theme }) => theme.text}; }
`

const StatsRow = styled.div`
  display: flex; align-items: center; gap: 1.5rem;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px; padding: 1rem 1.5rem;
`

const Stat = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
  flex: 1;

  .num {
    font-size: 1.5rem; font-weight: 700;
    color: ${({ theme }) => theme.primary};
  }
  .label {
    font-size: 0.72rem; color: ${({ theme }) => theme.textMuted};
    text-align: center;
  }
`

const StatDivider = styled.div`
  width: 1px; height: 2.5rem;
  background: ${({ theme }) => theme.border};
`

const SeccionTitulo = styled.h3`
  font-size: 0.75rem; font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
  margin: 0;
`

const Cargando = styled.p`
  text-align: center; padding: 1.5rem;
  color: ${({ theme }) => theme.textMuted}; font-size: 0.875rem;
`

const TablaWrapper = styled.div`
  overflow-x: auto; border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
`

const Tabla = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.875rem;
`

const Th = styled.th`
  text-align: left; padding: 0.625rem 1rem;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.72rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  white-space: nowrap;

  &.hide-sm { display: none; }
  @media ${bp.md} { &.hide-sm { display: table-cell; } }
`

const Tr = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.surfaceHover}; }
`

const Td = styled.td`
  padding: 0.625rem 1rem;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;

  &.hide-sm { display: none; }
  @media ${bp.md} { &.hide-sm { display: table-cell; } }
`

const ModalFooter = styled.div`
  display: flex; justify-content: flex-end; gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`

const CancelBtn = styled.button`
  height: 36px; padding: 0 1rem; border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: transparent; color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.surfaceHover}; }
`

const DetalleBtn = styled.button`
  height: 36px; padding: 0 1.25rem; border-radius: 8px; border: none;
  background: ${({ theme }) => theme.primary};
  color: #fff; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; gap: 0.375rem;
  &:hover { background: ${({ theme }) => theme.primaryHover}; }
`
