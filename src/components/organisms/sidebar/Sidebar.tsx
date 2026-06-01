import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import {
  MdDashboard,
  MdWarehouse,
  MdGridView,
  MdReceiptLong,
  MdCategory,
  MdPeople,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  MdLogout,
} from 'react-icons/md'
import { useAuth } from '@/context/AuthContext'
import { useUiStore } from '@/store/uiStore'
import { bp } from '@/styles/breakpoints'

export const SIDEBAR_W_OPEN = 240
export const SIDEBAR_W_CLOSED = 64

interface NavItem {
  key: string
  path: string
  icon: React.ElementType
  end?: boolean
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', path: '/', icon: MdDashboard, end: true },
  { key: 'almacen', path: '/almacen', icon: MdWarehouse },
  { key: 'racks', path: '/almacen/racks', icon: MdGridView, end: true },
  { key: 'ventas', path: '/ventas', icon: MdReceiptLong },
  { key: 'categorias', path: '/categorias', icon: MdCategory },
  { key: 'usuarios', path: '/usuarios', icon: MdPeople, adminOnly: true },
  { key: 'configuracion', path: '/configuracion', icon: MdSettings },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const { usuario, signOut } = useAuth()
  const { sidebarAbierto, toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const items = NAV_ITEMS.filter(
    (item) => !item.adminOnly || usuario?.rol === 'admin'
  )

  return (
    <Nav $open={sidebarAbierto}>
      <LogoArea>
        {/* reemplazar por <img src="/sga_logo.svg" /> cuando el usuario suba el archivo */}
        <LogoMark>SGA</LogoMark>
        {sidebarAbierto && <LogoText>Almacén</LogoText>}
      </LogoArea>

      <ToggleBtn
        onClick={toggleSidebar}
        title={sidebarAbierto ? 'Contraer' : 'Expandir'}
      >
        {sidebarAbierto ? (
          <MdChevronLeft size={18} />
        ) : (
          <MdChevronRight size={18} />
        )}
      </ToggleBtn>

      <NavList>
        {items.map(({ key, path, icon: Icon, end }) => (
          <li key={key}>
            <Item
              to={path}
              end={end}
              title={!sidebarAbierto ? t(`nav.${key}`) : undefined}
            >
              <Icon size={20} />
              {sidebarAbierto && <span>{t(`nav.${key}`)}</span>}
            </Item>
          </li>
        ))}
      </NavList>

      <Footer>
        {sidebarAbierto && usuario && (
          <UserInfo>
            <UserName>{usuario.nombre}</UserName>
            <UserRole>{usuario.rol}</UserRole>
          </UserInfo>
        )}
        <LogoutBtn
          onClick={handleSignOut}
          title={!sidebarAbierto ? t('nav.cerrarSesion') : undefined}
        >
          <MdLogout size={18} />
          {sidebarAbierto && <span>{t('nav.cerrarSesion')}</span>}
        </LogoutBtn>
      </Footer>
    </Nav>
  )
}

const Nav = styled.nav<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ $open }) => ($open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED)}px;
  background: ${({ theme }) => theme.sidebar};
  border-right: 1px solid ${({ theme }) => theme.sidebarBorder};
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  z-index: 100;
  overflow: hidden;

  /* el sidebar mobile se encarga de esto */
  @media ${bp.maxMd} {
    display: none;
  }
`

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  min-height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.sidebarBorder};
  overflow: hidden;
`

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  flex-shrink: 0;
`

const LogoText = styled.span`
  color: ${({ theme }) => theme.sidebarTextActive};
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
`

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0.75rem auto;
  border-radius: 50%;
  background: ${({ theme }) => theme.sidebarHover};
  border: 1px solid ${({ theme }) => theme.sidebarBorder};
  color: ${({ theme }) => theme.sidebarText};
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarActive};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`

const NavList = styled.ul`
  list-style: none;
  flex: 1;
  padding: 0.25rem 0;
  overflow-y: auto;
  overflow-x: hidden;
`

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.65rem 1rem;
  margin: 0.125rem 0.5rem;
  border-radius: 8px;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }

  &.active {
    background: ${({ theme }) => theme.sidebarActive};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.sidebarBorder};
  padding: 0.875rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const UserInfo = styled.div`
  padding: 0.25rem 0.5rem;
  overflow: hidden;
`

const UserName = styled.p`
  color: ${({ theme }) => theme.sidebarTextActive};
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const UserRole = styled.p`
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.75rem;
  text-transform: capitalize;
`

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`
