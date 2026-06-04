import { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'
import { MdOutlineInventory2 } from 'react-icons/md'
import { TablaCajas } from '@/components/organisms/tables/TablaCajas'
import { FormCaja } from '@/components/organisms/forms/FormCaja'
import { useRegistrosCaja } from '@/hooks/useCajas'
import { fetchProductoBasico } from '@/services/productosService'
import { useAuth } from '@/context/AuthContext'
import { bp } from '@/styles/breakpoints'
import type { RegistroCaja } from '@/types/cajas'

export default function CajasProducto() {
  const { t } = useTranslation()
  const { productoId } = useParams<{ productoId: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const id = Number(productoId)

  const esAdmin = usuario?.rol === 'admin'

  const { data: producto } = useQuery({
    queryKey: ['producto-basico', id],
    queryFn: () => fetchProductoBasico(id),
    enabled: id > 0,
    staleTime: 1000 * 60 * 5,
  })

  const { data = [], isLoading } = useRegistrosCaja(id)

  const [formOpen, setFormOpen] = useState(false)
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroCaja | undefined>()

  function handleEditar(registro: RegistroCaja) {
    setRegistroSeleccionado(registro)
    setFormOpen(true)
  }

  function handleNuevo() {
    setRegistroSeleccionado(undefined)
    setFormOpen(true)
  }

  function handleClose() {
    setFormOpen(false)
    setRegistroSeleccionado(undefined)
  }

  return (
    <Container>
      {formOpen && (
        <FormCaja productoId={id} registro={registroSeleccionado} onClose={handleClose} />
      )}

      <Header>
        <TitleRow>
          <BackBtn onClick={() => navigate('/almacen')} title={t('cajas.volver')}>
            <FiArrowLeft size={18} />
          </BackBtn>
          <MdOutlineInventory2 size={22} />
          <div>
            <h1>{t('cajas.titulo')}</h1>
            {producto && (
              <Subtitulo>
                {producto.codigo} — {producto.nombre}
              </Subtitulo>
            )}
          </div>
        </TitleRow>

        {esAdmin && (
          <NewBtn onClick={handleNuevo}>
            <FiPlus size={15} />
            {t('cajas.agregar_entrada')}
          </NewBtn>
        )}
      </Header>

      <Card>
        <TablaCajas
          productoId={id}
          data={data}
          isLoading={isLoading}
          onEditar={handleEditar}
        />
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
  gap: 0.75rem;
  color: ${({ theme }) => theme.text};

  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
  }

  svg:last-of-type {
    color: ${({ theme }) => theme.primary};
    flex-shrink: 0;
  }

  @media ${bp.maxSm} {
    h1 {
      font-size: 1.1rem;
    }
  }
`

const Subtitulo = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
`

const BackBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  align-items: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
    color: ${({ theme }) => theme.text};
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
