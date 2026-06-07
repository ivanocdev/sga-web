import styled, { useTheme } from 'styled-components'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useRacksMarca } from '@/hooks/useDashboard'

export function CardRacksMarca() {
  const { data = [], isLoading } = useRacksMarca()
  const theme = useTheme()

  // recharts necesita libres calculado aquí para el stack
  const chartData = data.map(m => ({
    nombre: m.nombre,
    ocupados: m.ocupados,
    libres: m.total - m.ocupados,
  }))

  return (
    <Container>
      <div className="card-header">
        <h3>Distribución de racks</h3>
      </div>

      {isLoading ? (
        <div className="card-loading"><p>Cargando...</p></div>
      ) : chartData.length > 0 ? (
        <div className="card-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="nombre"
                tick={{ fontSize: 11, fill: theme.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: theme.textMuted }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: theme.text, fontWeight: 600 }}
                cursor={{ fill: theme.primaryLight }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Bar dataKey="ocupados" name="Ocupados" stackId="racks" fill={theme.warning} radius={[0, 0, 0, 0]} maxBarSize={48} />
              <Bar dataKey="libres"   name="Libres"   stackId="racks" fill={theme.success} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card-empty"><p>Sin racks registrados</p></div>
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
    margin-bottom: 10px;
    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: ${({ theme }) => theme.text};
    }
  }

  .card-chart {
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
