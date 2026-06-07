import styled from 'styled-components'
import { useMovimientosRecientes } from '@/hooks/useDashboard'
import { bp } from '@/styles/breakpoints'

export function CardMovimientos() {
  const { data = [], isLoading } = useMovimientosRecientes()

  return (
    <Container>
      <div className="card-header">
        <h3>Movimientos recientes</h3>
      </div>

      {isLoading ? (
        <div className="card-loading"><p>Cargando...</p></div>
      ) : data.length > 0 ? (
        <div className="tabla">
          <div className="tabla-header">
            <span>Código</span>
            <span>Cantidad</span>
            <span>Marca</span>
            <span>Día</span>
            <span>Tipo</span>
          </div>
          {data.map((mov, i) => (
            <div key={i} className="tabla-row">
              <span className="truncate">{mov.pedido}</span>
              <span>{mov.cantidad}</span>
              <span className="truncate">{mov.marca}</span>
              <span>{mov.dia}</span>
              <span className={`tipo tipo-${mov.tipo}`}>
                {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-empty"><p>Sin movimientos recientes</p></div>
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

  .tabla {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }

  .tabla-header,
  .tabla-row {
    display: grid;
    grid-template-columns: 1.8fr 1fr 1.5fr 0.9fr 0.8fr;
    gap: 8px;
    align-items: center;
    padding: 0 4px;

    @media ${bp.maxMd} {
      grid-template-columns: 1.5fr 0.8fr 1.2fr 0.7fr 0.7fr;
      gap: 4px;
    }
  }

  .tabla-header {
    font-size: 11px;
    font-weight: 600;
    color: ${({ theme }) => theme.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }

  .tabla-row {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text};
    padding-top: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    &:last-child { border-bottom: none; }
  }

  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tipo {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    text-align: center;
    font-weight: 500;
  }

  .tipo-entrada {
    background: ${({ theme }) => theme.primaryLight};
    color: ${({ theme }) => theme.primary};
  }

  .tipo-salida {
    background: rgba(220, 38, 38, 0.08);
    color: ${({ theme }) => theme.danger};
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
