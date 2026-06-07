import { useMemo, useCallback, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { FiUsers, FiPlus } from 'react-icons/fi'
import { TablaUsuarios } from '@/components/organisms/tables/TablaUsuarios'
import { FormRegistrarUsuario } from '@/components/organisms/forms/FormRegistrarUsuario'
import { SearchInput } from '@/components/atoms/SearchInput'
import { useUsuarios } from '@/hooks/useUsuarios'
import { bp } from '@/styles/breakpoints'
import type { Usuario } from '@/types/auth'

export default function Usuarios() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useUsuarios()
  const [busqueda, setBusqueda] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const filtrados = useMemo<Usuario[]>(() => {
    if (!busqueda.trim()) return data
    const q = busqueda.toLowerCase()
    return data.filter(
      u => u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q)
    )
  }, [data, busqueda])

  const handleSearch = useCallback((v: string) => setBusqueda(v), [])

  return (
    <Container>
      {formOpen && <FormRegistrarUsuario onClose={() => setFormOpen(false)} />}

      <Header>
        <TitleRow>
          <FiUsers size={22} />
          <h1>{t('usuarios.titulo')}</h1>
        </TitleRow>
        <Controls>
          <SearchInput onSearch={handleSearch} placeholder={`${t('common.buscar')}...`} />
          <NuevoBtn onClick={() => setFormOpen(true)}>
            <FiPlus size={15} />
            {t('usuarios.agregar')}
          </NuevoBtn>
        </Controls>
      </Header>

      <Content>
        <TablaUsuarios data={filtrados} isLoading={isLoading} />
      </Content>
    </Container>
  )
}

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
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.surface};
`
