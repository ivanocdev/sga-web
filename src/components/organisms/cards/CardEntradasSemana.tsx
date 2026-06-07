import styled, { useTheme } from 'styled-components'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useEntradasSemana } from '@/hooks/useDashboard'

const COLORES = ['#2563eb', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef']

export function CardEntradasSemana() {
  const { data, isLoading } = useEntradasSemana()
  const theme = useTheme()

  const items = data?.data ?? []
  const total = data?.total ?? 0

  return (
    <Container>
      <div className="card-header">
        <h3>Entradas</h3>
      </div>

      {isLoading ? (
        <div className="card-loading"><p>Cargando...</p></div>
      ) : items.length > 0 ? (
        <div className="chart-content">
          <div className="pie-meta">
            <span className="subtitulo">Esta semana</span>
            <span className="total">{total}</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="85%"
                  paddingAngle={2}
                  dataKey="cantidad"
                  nameKey="nombre"
                >
                  {items.map((_, idx) => (
                    <Cell key={idx} fill={COLORES[idx % COLORES.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: theme.text }}
                  formatter={(v) => [v, 'Entradas']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card-empty"><p>Sin entradas esta semana</p></div>
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

  .chart-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .pie-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    flex-shrink: 0;
  }

  .subtitulo {
    font-size: 11px;
    color: ${({ theme }) => theme.textMuted};
  }

  .total {
    font-size: 22px;
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }

  .chart-wrap {
    flex: 1;
    min-height: 100px;
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
