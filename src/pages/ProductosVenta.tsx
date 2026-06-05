import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiArrowLeft } from 'react-icons/fi'
import styled from 'styled-components'
import { bp } from '@/styles/breakpoints'
import { TablaProductosVenta } from '@/components/organisms/tables/TablaProductosVenta'
import { useEquipoVenta, useAyudantesVenta } from '@/hooks/useVentas'

export default function ProductosVenta() {
  const { ventaId } = useParams<{ ventaId: string }>()
  const id = Number(ventaId)
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: equipo } = useEquipoVenta(id)
  const { data: ayudantes = [] } = useAyudantesVenta(id)

  const isDevolucion = equipo?.estado === 'Devolucion'

  return (
    <PageWrapper>
      <Header>
        <BackBtn onClick={() => navigate('/ventas')} title={t('ventas.volver')}>
          <FiArrowLeft size={18} />
          <span>{t('ventas.volver')}</span>
        </BackBtn>

        <TituloBloque>
          <h1>{t('ventas.productos_venta')}</h1>
          {isDevolucion && <DevolucionBadge>{t('ventas.devolucion_label')}</DevolucionBadge>}
        </TituloBloque>
      </Header>

      {/* info del equipo asignado — read-only en este commit, botón de asignar llega en el siguiente */}
      <EquipoCard>
        <EquipoItem>
          <span className="label">{t('ventas.responsable')}</span>
          <span className="value">
            {equipo?.usuarios?.nombres ?? <Muted>{t('ventas.sin_asignar')}</Muted>}
          </span>
        </EquipoItem>

        <EquipoItem>
          <span className="label">{t('ventas.ayudantes')}</span>
          <span className="value">
            {ayudantes.length > 0
              ? ayudantes.map(a => a.usuarios?.nombres ?? '?').join(', ')
              : <Muted>{t('ventas.sin_ayudantes')}</Muted>}
          </span>
        </EquipoItem>
      </EquipoCard>

      <TableContainer>
        <TablaProductosVenta ventaId={id} isDevolucion={isDevolucion ?? false} />
      </TableContainer>
    </PageWrapper>
  )
}

// --- estilos ---

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem 0.75rem;
  flex-shrink: 0;
`

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;

  span { display: none; }

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.surfaceHover};
  }

  @media ${bp.md} {
    span { display: inline; }
  }
`

const TituloBloque = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h1 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin: 0;
  }
`

const DevolucionBadge = styled.span`
  background: ${({ theme }) => `${theme.danger}20`};
  color: ${({ theme }) => theme.danger};
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
`

const EquipoCard = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.surface};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  flex-wrap: wrap;
  flex-shrink: 0;
`

const EquipoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;

  .label {
    color: ${({ theme }) => theme.textMuted};
    font-weight: 500;
  }

  .value {
    color: ${({ theme }) => theme.text};
  }
`

const Muted = styled.span`
  color: ${({ theme }) => theme.textMuted};
  font-style: italic;
  font-size: 0.8rem;
`

const TableContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.surface};
  margin: 0 1.5rem 1.5rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
`
