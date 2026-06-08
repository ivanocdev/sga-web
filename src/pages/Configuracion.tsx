import { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { FiSettings, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { FormMarca } from '@/components/organisms/forms/FormMarca'
import { CardCuenta } from '@/components/organisms/cards/CardCuenta'
import { useMarcas } from '@/hooks/useProductos'
import { useEliminarMarca } from '@/hooks/useMarcas'
import { bp } from '@/styles/breakpoints'
import Swal from 'sweetalert2'
import type { Marca } from '@/types/productos'

export default function Configuracion() {
  const { t } = useTranslation()
  const { data: marcas = [], isLoading: cargandoMarcas } = useMarcas()
  const { mutate: eliminarMarca } = useEliminarMarca()
  const [formMarca, setFormMarca] = useState<{ open: boolean; marca?: Marca }>({ open: false })

  const handleEliminarMarca = useCallback(
    (marca: Marca) => {
      void Swal.fire({
        title: '¿Eliminar marca?',
        text: `${marca.nombre} — se eliminará de todos los productos y racks asociados.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminarMarca(marca.id)
      })
    },
    [eliminarMarca, t]
  )

  return (
    <Container>
      {formMarca.open && (
        <FormMarca
          marca={formMarca.marca}
          onClose={() => setFormMarca({ open: false })}
        />
      )}

      <PageHeader>
        <FiSettings size={22} />
        <h1>{t('configuracion.titulo')}</h1>
      </PageHeader>

      <Grid>
        {/* ── Marcas ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('marcas.titulo')}</CardTitle>
            <AddBtn onClick={() => setFormMarca({ open: true, marca: undefined })}>
              <FiPlus size={14} />
              {t('marcas.agregar')}
            </AddBtn>
          </CardHeader>

          <CardBody>
            {cargandoMarcas ? (
              <Empty>{t('common.cargando')}</Empty>
            ) : marcas.length === 0 ? (
              <Empty>{t('marcas.sin_marcas')}</Empty>
            ) : (
              <List>
                {marcas.map(m => (
                  <ListItem key={m.id}>
                    <ItemName>{m.nombre}</ItemName>
                    <ItemActions>
                      <IconBtn
                        onClick={() => setFormMarca({ open: true, marca: m })}
                        title={t('common.editar')}
                      >
                        <FiEdit2 size={14} />
                      </IconBtn>
                      <IconBtn
                        $danger
                        onClick={() => handleEliminarMarca(m)}
                        title={t('common.eliminar')}
                      >
                        <FiTrash2 size={14} />
                      </IconBtn>
                    </ItemActions>
                  </ListItem>
                ))}
              </List>
            )}
          </CardBody>
        </Card>

        {/* ── Mi cuenta ── */}
        <CardCuenta />

        {/* el commit 7 agrega la Card de módulos aquí */}
      </Grid>
    </Container>
  )
}

// --- estilos ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
  gap: 1.5rem;
  box-sizing: border-box;
`

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: ${({ theme }) => theme.text};

  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  svg {
    color: ${({ theme }) => theme.primary};
    flex-shrink: 0;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media ${bp.md} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${bp.lg} {
    grid-template-columns: repeat(3, 1fr);
  }
`

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

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
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
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background 0.1s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }
`

const ItemName = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
`

const ItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
`

const IconBtn = styled.button<{ $danger?: boolean }>`
  background: transparent;
  border: none;
  padding: 0.3rem;
  border-radius: 5px;
  cursor: pointer;
  color: ${({ $danger, theme }) => ($danger ? theme.danger : theme.textMuted)};
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ $danger, theme }) =>
      $danger ? `${theme.danger}18` : theme.primaryLight};
    color: ${({ $danger, theme }) => ($danger ? theme.danger : theme.primary)};
  }
`

const Empty = styled.p`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.875rem;
  margin: 0;
`
