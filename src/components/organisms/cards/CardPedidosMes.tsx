import styled, { useTheme } from 'styled-components'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { usePedidosPorMes } from '@/hooks/useDashboard'

export function CardPedidosMes() {
  const { data = [], isLoading } = usePedidosPorMes()
  const theme = useTheme()

  return (
    <Container>
      <div className="card-header">
        <h3>Pedidos / año</h3>
      </div>

      {isLoading ? (
        <div className="card-loading"><p>Cargando...</p></div>
      ) : data.length > 0 ? (
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: theme.textMuted }}
                axisLine={false}
                tickLine={false}
                height={18}
              />
              <YAxis
                tick={{ fontSize: 11, fill: theme.textMuted }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: theme.text, fontWeight: 600 }}
                cursor={{ stroke: theme.border }}
                formatter={(v) => [v, 'Pedidos']}
              />
              <Line
                type="monotone"
                dataKey="cantidad"
                stroke={theme.primary}
                strokeWidth={2.5}
                dot={{ fill: theme.surface, stroke: theme.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: theme.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card-empty"><p>Sin pedidos registrados este año</p></div>
      )}
    </Container>
  )
}

const Container = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  padding: 14px 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .card-header {
    margin-bottom: 6px;
    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: ${({ theme }) => theme.text};
    }
  }

  .chart-wrap {
    flex: 1;
    min-height: 120px;
    .recharts-wrapper:focus { outline: none; }
    svg:focus { outline: none; }
  }

  .card-loading,
  .card-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    p {
      margin: 0;
      font-size: 12px;
      color: ${({ theme }) => theme.textMuted};
    }
  }

  .card-loading p {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`
