import styled from 'styled-components'
import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard'
import {
  useVentasMarca,
  useRacksMarca,
  useCajasMarca,
  useProductosMarca,
} from '@/hooks/useDashboard'
import { CardVentasMarca } from '@/components/organisms/cards/CardVentasMarca'
import { CardRacksMarca } from '@/components/organisms/cards/CardRacksMarca'
import { CardProximosCaducar } from '@/components/organisms/cards/CardProximosCaducar'
import { CardPedidosActivosDashboard } from '@/components/organisms/cards/CardPedidosActivosDashboard'
import { CardMovimientos } from '@/components/organisms/cards/CardMovimientos'
import { CardPedidosMes } from '@/components/organisms/cards/CardPedidosMes'
import { CardEntradasSemana } from '@/components/organisms/cards/CardEntradasSemana'
import { bp } from '@/styles/breakpoints'

interface StatProps {
  label: string
  value: number
  loading: boolean
}

function StatChip({ label, value, loading }: StatProps) {
  return (
    <StatCard>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{loading ? '—' : value.toLocaleString()}</span>
    </StatCard>
  )
}

export default function Dashboard() {
  // activa el listener de Supabase Realtime para las tablas del dashboard
  useRealtimeDashboard()

  const { data: ventas = [], isLoading: loadingVentas } = useVentasMarca()
  const { data: racks = [],  isLoading: loadingRacks  } = useRacksMarca()
  const { data: cajas = [],  isLoading: loadingCajas  } = useCajasMarca()
  const { data: productos = [], isLoading: loadingProductos } = useProductosMarca()

  const totalVentas   = ventas.reduce((a, m) => a + m.cantidad, 0)
  const totalRacks    = racks.reduce((a, m) => a + m.total, 0)
  const totalCajas    = cajas.reduce((a, m) => a + m.cantidad, 0)
  const totalProductos = productos.reduce((a, m) => a + m.cantidad, 0)

  return (
    <Wrapper>
      <h1 className="page-title">Dashboard</h1>

      <section className="stats">
        <StatChip label="Pedidos"   value={totalVentas}   loading={loadingVentas} />
        <StatChip label="Racks"     value={totalRacks}    loading={loadingRacks} />
        <StatChip label="Entradas"  value={totalCajas}    loading={loadingCajas} />
        <StatChip label="Productos" value={totalProductos} loading={loadingProductos} />
      </section>

      <section className="charts">
        <CardVentasMarca />
        <CardRacksMarca />
      </section>

      <section className="middle">
        <CardProximosCaducar />
        <CardPedidosActivosDashboard />
        <div className="movimientos">
          <CardMovimientos />
        </div>
      </section>

      <section className="bottom">
        <div className="pedidos-mes">
          <CardPedidosMes />
        </div>
        <CardEntradasSemana />
      </section>
    </Wrapper>
  )
}

const StatCard = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-label {
    font-size: 12px;
    color: ${({ theme }) => theme.textMuted};
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
    line-height: 1;
  }
`

const Wrapper = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  box-sizing: border-box;

  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }

  /* ---------- stats ---------- */
  .stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    @media ${bp.lg} {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* ---------- bar charts ---------- */
  .charts {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: 220px;

    @media ${bp.md} {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* ---------- middle row ---------- */
  .middle {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: 240px;

    .movimientos { min-height: 200px; }

    @media ${bp.md} {
      grid-template-columns: repeat(2, 1fr);
      .movimientos { grid-column: span 2; }
    }

    @media ${bp.lg} {
      grid-template-columns: 1fr 1fr 2fr;
      .movimientos { grid-column: auto; }
    }
  }

  /* ---------- bottom row ---------- */
  .bottom {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    min-height: 220px;

    .pedidos-mes { min-height: 200px; }

    @media ${bp.md} {
      grid-template-columns: 3fr 1fr;
    }
  }
`
