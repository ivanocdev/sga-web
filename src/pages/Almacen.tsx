import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { LuWarehouse } from 'react-icons/lu'
import { FiPlus, FiUploadCloud } from 'react-icons/fi'
import { TablaProductos } from '@/components/organisms/tables/TablaProductos'
import { SearchInput } from '@/components/atoms/SearchInput'
import { FiltroMarcas } from '@/components/molecules/FiltroMarcas'
import { FormProducto } from '@/components/organisms/forms/FormProducto'
import { CargarProductosExcel } from '@/components/molecules/CargarProductosExcel'
import { useProductos } from '@/hooks/useProductos'
import { useProductosStore } from '@/store/productosStore'
import { bp } from '@/styles/breakpoints'
import type { Producto } from '@/types/productos'

export default function Almacen() {
  const { t } = useTranslation()
  const { data = [], isLoading } = useProductos()
  const { setBusqueda } = useProductosStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>()
  const [importOpen, setImportOpen] = useState(false)

  // referencia estable para que el debounce no se reinicie en cada render
  const handleSearch = useCallback((v: string) => setBusqueda(v), [setBusqueda])

  function handleEditar(producto: Producto) {
    setEditId(producto.id)
    setFormOpen(true)
  }

  function handleNuevo() {
    setEditId(undefined)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setEditId(undefined)
  }

  return (
    <Container>
      {formOpen && <FormProducto productoId={editId} onClose={handleClose} />}
      {importOpen && <CargarProductosExcel onClose={() => setImportOpen(false)} />}

      <Header>
        <TitleRow>
          <LuWarehouse size={22} />
          <h1>{t('productos.titulo')}</h1>
        </TitleRow>
        <Buttons>
          <SearchInput onSearch={handleSearch} />
          <FiltroMarcas />
          <ImportBtn onClick={() => setImportOpen(true)}>
            <FiUploadCloud size={15} />
            Cargar Excel
          </ImportBtn>
          <NewBtn onClick={handleNuevo}>
            <FiPlus size={15} />
            {t('productos.agregar')}
          </NewBtn>
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

const ImportBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: 38px;
  padding: 0 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }

  svg {
    color: ${({ theme }) => theme.success};
  }
`

const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  height: 38px;
  padding: 0 1rem;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`
