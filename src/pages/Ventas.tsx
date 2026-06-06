import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus, FiRotateCcw } from 'react-icons/fi'
import { LuShoppingCart } from 'react-icons/lu'
import styled from 'styled-components'
import { TablaVentas } from '@/components/organisms/tables/TablaVentas'
import { FormVenta } from '@/components/organisms/forms/FormVenta'
import { FormDevolucion } from '@/components/organisms/forms/FormDevolucion'
import { DetalleVentaModal } from '@/components/organisms/cards/DetalleVentaModal'
import { SearchInput } from '@/components/atoms/SearchInput'
import { useVentas } from '@/hooks/useVentas'
import { useVentasStore } from '@/store/ventasStore'
import { useAuth } from '@/context/AuthContext'
import { bp } from '@/styles/breakpoints'
import type { Venta } from '@/types/ventas'

export default function Ventas() {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const { data = [], isLoading } = useVentas()
  const { setBusqueda, busqueda } = useVentasStore()

  const [formOpen, setFormOpen] = useState(false)
  const [ventaEditar, setVentaEditar] = useState<Venta | undefined>()
  const [devolucionOpen, setDevolucionOpen] = useState(false)
  const [ventaResumen, setVentaResumen] = useState<Venta | null>(null)

  const esAdmin = usuario?.rol === 'admin'

  const handleSearch = useCallback((v: string) => setBusqueda(v), [setBusqueda])

  function handleNueva() {
    setVentaEditar(undefined)
    setFormOpen(true)
  }

  function handleEditar(venta: Venta) {
    setVentaEditar(venta)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setVentaEditar(undefined)
  }

  return (
    <Container>
      {formOpen && <FormVenta ventaEditar={ventaEditar} onClose={handleCloseForm} />}
      {devolucionOpen && <FormDevolucion onClose={() => setDevolucionOpen(false)} />}
      {ventaResumen && (
        <DetalleVentaModal venta={ventaResumen} onClose={() => setVentaResumen(null)} />
      )}

      <Header>
        <TitleRow>
          <LuShoppingCart size={22} />
          <h1>{t('ventas.titulo')}</h1>
        </TitleRow>

        <Buttons>
          <SearchInput onSearch={handleSearch} placeholder={t('ventas.codigo')} />

          {esAdmin && (
            <DevBtn onClick={() => setDevolucionOpen(true)}>
              <FiRotateCcw size={15} />
              <span>{t('ventas.devolucion')}</span>
            </DevBtn>
          )}

          <NewBtn onClick={handleNueva}>
            <FiPlus size={15} />
            {t('ventas.agregar')}
          </NewBtn>
        </Buttons>
      </Header>

      <Card>
        <TablaVentas
          data={data}
          isLoading={isLoading}
          onEditar={handleEditar}
          onVerResumen={v => setVentaResumen(v)}
          busqueda={busqueda}
        />
      </Card>
    </Container>
  )
}

// --- estilos ---

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

  h1 { font-size: 1.25rem; font-weight: 600; margin: 0; }
  svg { color: ${({ theme }) => theme.primary}; }
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

const DevBtn = styled.button`
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

  &:hover { background: ${({ theme }) => theme.surfaceHover}; }

  svg { color: ${({ theme }) => theme.warning}; }

  span { display: none; }
  @media ${bp.md} { span { display: inline; } }
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

  &:hover { background: ${({ theme }) => theme.primaryHover}; }
`
