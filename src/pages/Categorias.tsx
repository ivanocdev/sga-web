import { useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { FiTag, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { FormCategoria } from '@/components/organisms/forms/FormCategoria'
import { SearchInput } from '@/components/atoms/SearchInput'
import { useCategorias, useEliminarCategoria } from '@/hooks/useCategorias'
import { bp } from '@/styles/breakpoints'
import Swal from 'sweetalert2'
import type { Categoria } from '@/types/categorias'

export default function Categorias() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useCategorias()
  const { mutate: eliminar } = useEliminarCategoria()
  const [busqueda, setBusqueda] = useState('')
  const [form, setForm] = useState<{ open: boolean; categoria?: Categoria }>({ open: false })

  const filtradas = useMemo<Categoria[]>(() => {
    if (!busqueda.trim()) return data
    const q = busqueda.toLowerCase()
    return data.filter(c => c.nombre.toLowerCase().includes(q))
  }, [data, busqueda])

  const handleSearch = useCallback((v: string) => setBusqueda(v), [])

  const handleEliminar = useCallback(
    (cat: Categoria) => {
      void Swal.fire({
        title: '¿Eliminar categoría?',
        text: cat.nombre,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonText: t('common.cancelar'),
        confirmButtonText: t('common.eliminar'),
      }).then(res => {
        if (res.isConfirmed) eliminar(cat.id)
      })
    },
    [eliminar, t]
  )

  return (
    <Container>
      {form.open && (
        <FormCategoria
          categoria={form.categoria}
          onClose={() => setForm({ open: false })}
        />
      )}

      <Header>
        <TitleRow>
          <FiTag size={22} />
          <h1>{t('categorias.titulo')}</h1>
        </TitleRow>
        <Controls>
          <SearchInput onSearch={handleSearch} placeholder={`${t('common.buscar')}...`} />
          <NuevoBtn onClick={() => setForm({ open: true, categoria: undefined })}>
            <FiPlus size={15} />
            {t('categorias.agregar')}
          </NuevoBtn>
        </Controls>
      </Header>

      <Content>
        {isLoading ? (
          <Estado>{t('common.cargando')}</Estado>
        ) : filtradas.length === 0 ? (
          <Estado>{busqueda ? t('common.sin_resultados') : t('categorias.sin_categorias')}</Estado>
        ) : (
          <Grid>
            {filtradas.map(cat => (
              <CatCard key={cat.id}>
                <ColorDot $color={cat.color} />
                <CatName>{cat.nombre}</CatName>
                <Actions>
                  <IconBtn
                    onClick={() => setForm({ open: true, categoria: cat })}
                    title={t('common.editar')}
                  >
                    <FiEdit2 size={14} />
                  </IconBtn>
                  <IconBtn $danger onClick={() => handleEliminar(cat)} title={t('common.eliminar')}>
                    <FiTrash2 size={14} />
                  </IconBtn>
                </Actions>
              </CatCard>
            ))}
          </Grid>
        )}
      </Content>
    </Container>
  )
}

// --- estilos ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};

  @media ${bp.md} {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`

const TitleRow = styled.div`
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

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const NuevoBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media ${bp.md} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${bp.lg} {
    grid-template-columns: repeat(4, 1fr);
  }
`

const CatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }
`

const ColorDot = styled.span<{ $color: string | null }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $color }) => $color ?? '#94a3b8'};
`

const CatName = styled.span`
  flex: 1;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Actions = styled.div`
  display: flex;
  gap: 0.2rem;
  flex-shrink: 0;
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

const Estado = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.textMuted};
  font-size: 0.9rem;
`
