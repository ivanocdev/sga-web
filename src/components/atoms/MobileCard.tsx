import styled from 'styled-components'

// base reutilizable para mostrar filas de tabla como cards en mobile
// los módulos 4-8 importan esto en lugar de inventar cada uno su card

interface MobileCardProps {
  children: React.ReactNode
  onClick?: () => void
}

export function MobileCard({ children, onClick }: MobileCardProps) {
  return (
    <Card onClick={onClick} $clickable={!!onClick}>
      {children}
    </Card>
  )
}

interface RowProps {
  label: string
  value: React.ReactNode
}

export function MobileCardRow({ label, value }: RowProps) {
  return (
    <Row>
      <RowLabel>{label}</RowLabel>
      <RowValue>{value}</RowValue>
    </Row>
  )
}

const Card = styled.div<{ $clickable: boolean }>`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background 0.15s;

  &:hover {
    background: ${({ $clickable, theme }) =>
      $clickable ? theme.surfaceHover : theme.surface};
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`

const RowLabel = styled.span`
  color: ${({ theme }) => theme.textMuted};
  font-weight: 500;
  flex-shrink: 0;
`

const RowValue = styled.span`
  color: ${({ theme }) => theme.text};
  text-align: right;
`
