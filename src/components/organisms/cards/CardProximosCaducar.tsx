import styled from 'styled-components'
import { useProximosCaducar } from '@/hooks/useDashboard'

// mismos umbrales de color que TablaCajas para consistencia visual
function colorDias(dias: number): string {
  if (dias <= 0)  return '#fddcdc'
  if (dias <= 15) return '#fddcdc'
  if (dias <= 30) return '#fff3b0'
  return '#d1f7c4'
}

export function CardProximosCaducar() {
  const { data = [], isLoading } = useProximosCaducar()

  return (
    <Container>
      <div className="card-header">
        <h3>Próximos a caducar</h3>
      </div>

      {isLoading ? (
        <div className="card-loading"><p>Cargando...</p></div>
      ) : data.length > 0 ? (
        <ul className="lista">
          {data.map((item, i) => (
            <li key={i} className="item">
              <div className="info">
                <span className="codigo">{item.codigo_barras}</span>
                <span className="marca">{item.marca}</span>
              </div>
              <span className="badge" style={{ backgroundColor: colorDias(item.dias) }}>
                {item.dias <= 0
                  ? 'Vencido'
                  : `${item.dias} ${item.dias === 1 ? 'día' : 'días'}`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card-empty"><p>Sin productos próximos a caducar</p></div>
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

  .lista {
    flex: 1;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  .item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    &:last-child { border-bottom: none; }
  }

  .info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    margin-right: 8px;
  }

  .codigo {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .marca {
    font-size: 11px;
    color: ${({ theme }) => theme.textMuted};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge {
    flex-shrink: 0;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
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
