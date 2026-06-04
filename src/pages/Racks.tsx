import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { MdOutlineStorage } from 'react-icons/md'
import { FiPlus } from 'react-icons/fi'
import { TablaRacks } from '@/components/organisms/tables/TablaRacks'
import { FormRack } from '@/components/organisms/forms/FormRack'
import { SearchInput } from '@/components/atoms/SearchInput'
import { useRacks } from '@/hooks/useRacks'
import { useRacksStore } from '@/store/racksStore'
import { useAuth } from '@/context/AuthContext'
import { bp } from '@/styles/breakpoints'
import type { Rack } from '@/types/racks'

export default function Racks() {
  const { t } = useTranslation()
  const { usuario } = useAuth()
  const { data = [], isLoading } = useRacks()
  const { setBusqueda } = useRacksStore()
  const [formOpen, setFormOpen] = useState(false)
  const [rackSeleccionado, setRackSeleccionado] = useState<Rack | undefined>()

  const esAdmin = usuario?.rol === 'admin'

  const handleSearch = useCallback((v: string) => setBusqueda(v), [setBusqueda])

  function handleEditar(rack: Rack) {
    setRackSeleccionado(rack)
    setFormOpen(true)
  }

  function handleNuevo() {
    setRackSeleccionado(undefined)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setRackSeleccionado(undefined)
  }

  return (
    <Container>
      {formOpen && <FormRack rack={rackSeleccionado} onClose={handleClose} />}

      <Header>
        <TitleRow>
          <MdOutlineStorage size={22} />
          <h1>{t('racks.titulo')}</h1>
        </TitleRow>
        <Buttons>
          <SearchInput onSearch={handleSearch} placeholder={`${t('common.buscar')} rack...`} />
          {esAdmin && (
            <NewBtn onClick={handleNuevo}>
              <FiPlus size={15} />
              {t('racks.nuevo')}
            </NewBtn>
          )}
        </Buttons>
      </Header>

      <Card>
        <TablaRacks data={data} isLoading={isLoading} onEditar={handleEditar} />
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
