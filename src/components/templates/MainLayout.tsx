import { Outlet, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'

// barra temporal hasta que llegue el sidebar en Bloque 3
export default function MainLayout() {
  const { usuario, signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <Wrapper>
      <TopBar>
        <AppName>SGA</AppName>
        <UserArea>
          {usuario && (
            <UserInfo>
              {usuario.nombre} · <Role>{usuario.rol}</Role>
            </UserInfo>
          )}
          <SignOutBtn onClick={handleSignOut}>{t('nav.cerrarSesion')}</SignOutBtn>
        </UserArea>
      </TopBar>
      <Content>
        <Outlet />
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const TopBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 56px;
  background: #1a1a2e;
  color: #fff;
`

const AppName = styled.span`
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.05em;
`

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const UserInfo = styled.span`
  font-size: 0.875rem;
  color: #cbd5e1;
`

const Role = styled.span`
  text-transform: capitalize;
`

const SignOutBtn = styled.button`
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: 1px solid #475569;
  border-radius: 5px;
  color: #cbd5e1;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: #94a3b8;
    color: #fff;
  }
`

const Content = styled.main`
  flex: 1;
  padding: 1.5rem;
`
