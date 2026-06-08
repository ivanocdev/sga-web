import styled from 'styled-components'
import { useModulos, useToggleModulo } from '@/hooks/useModulos'
import { useTranslation } from 'react-i18next'

// módulos core que no se pueden desactivar — romperían la navegación
const BLOQUEADOS = new Set(['/', '/configuracion'])

export function CardModulos() {
  const { t } = useTranslation()
  const { data: modulos = [], isLoading } = useModulos()
  const { mutate: toggle, isPending } = useToggleModulo()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulos del sistema</CardTitle>
      </CardHeader>

      <CardBody>
        {isLoading ? (
          <Empty>{t('common.cargando')}</Empty>
        ) : modulos.length === 0 ? (
          <Empty>Sin módulos registrados</Empty>
        ) : (
          <List>
            {modulos.map(m => {
              const bloqueado = BLOQUEADOS.has(m.link)
              return (
                <ListItem key={m.id}>
                  <ItemInfo>
                    <ItemNombre>{m.nombre}</ItemNombre>
                    {m.descripcion && <ItemDesc>{m.descripcion}</ItemDesc>}
                  </ItemInfo>
                  <ToggleWrapper
                    title={bloqueado ? 'Este módulo no puede desactivarse' : undefined}
                  >
                    <Toggle
                      type="checkbox"
                      checked={m.activo}
                      disabled={isPending || bloqueado}
                      onChange={e => toggle({ id: m.id, activo: e.target.checked })}
                    />
                  </ToggleWrapper>
                </ListItem>
              )
            })}
          </List>
        )}
      </CardBody>
    </Card>
  )
}

// --- estilos ---

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowCard};
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
`

const CardTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CardBody = styled.div`
  padding: 0.5rem 0;
  max-height: 320px;
  overflow-y: auto;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  gap: 0.75rem;

  &:last-child {
    border-bottom: none;
  }
`

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`

const ItemNombre = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`

const ItemDesc = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ToggleWrapper = styled.div`
  flex-shrink: 0;
`

const Toggle = styled.input`
  width: 1.1rem;
  height: 1.1rem;
  accent-color: ${({ theme }) => theme.primary};
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const Empty = styled.p`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
  margin: 0;
`
