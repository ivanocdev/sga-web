import { useCallback } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { LuWarehouse } from 'react-icons/lu'
import { TablaProductos } from '@/components/organisms/tables/TablaProductos'
import { SearchInput } from '@/components/atoms/SearchInput'
import { FiltroMarcas } from '@/components/molecules/FiltroMarcas'
import { useProductos } from '@/hooks/useProductos'
import { useProductosStore } from '@/store/productosStore'
import { bp } from '@/styles/breakpoints'
import type { Producto } from '@/types/productos'

export default function Almacen() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useProductos()
  const { setBusqueda } = useProductosStore()

  // referencia estable para que el debounce no se reinicie en cada render
  const handleSearch = useCallback((v: string) => setBusqueda(v), [setBusqueda])

  const handleEditar = (_producto: Producto) => {}

  return (
    <Container>
      <Header>
        <TitleRow>
          <LuWarehouse size={22} />
          <h1>{t('productos.titulo')}</h1>
        </TitleRow>
        <Buttons>
          <SearchInput onSearch={handleSearch} />
          <FiltroMarcas />
        </Buttons>
      </Header>

      <Card>
        <TablaProductos data={data} isLoading={isLoading} onEditar={handleEditar} />
      </Card>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text};

  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  svg {
    color: ${({ theme }) => theme.primary};
  }
`

const Buttons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;

  @media ${bp.maxSm} {
    width: 100%;
    justify-content: flex-end;
  }
`

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  box-shadow: ${({ theme }) => theme.shadowCard};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
  min-height: 0;
`
