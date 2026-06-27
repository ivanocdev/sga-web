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
import { useModulos } from '@/hooks/useModulos'
import { bp } from '@/styles/breakpoints'
import ThemeToggle from '@/components/atoms/ThemeToggle'
import LanguageToggle from '@/components/atoms/LanguageToggle'

export const SIDEBAR_W_OPEN = 240
export const SIDEBAR_W_CLOSED = 64
const SIDEBAR_PADDING = 16
// ancho total incluyendo el padding del wrapper flotante
export const SIDEBAR_OFFSET_OPEN = SIDEBAR_W_OPEN + SIDEBAR_PADDING * 2
export const SIDEBAR_OFFSET_CLOSED = SIDEBAR_W_CLOSED + SIDEBAR_PADDING * 2

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
  const { data: modulos = [] } = useModulos()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  // si modulos aún no cargó mostramos todo (evita sidebar vacío en el primer render)
  const activosPaths = modulos.length > 0
    ? new Set(modulos.filter(m => m.activo).map(m => m.link))
    : null

  const items = NAV_ITEMS.filter(item =>
    (!item.adminOnly || usuario?.rol === 'admin') &&
    (activosPaths === null || activosPaths.has(item.path))
  )

  return (
    <Nav $open={sidebarAbierto}>
      <SidebarInner>
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
          <Controls $open={sidebarAbierto}>
            <ThemeToggle showLabel={sidebarAbierto} />
            {sidebarAbierto && <LanguageToggle />}
          </Controls>

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
      </SidebarInner>
    </Nav>
  )
}

// wrapper transparente — solo define el espacio que ocupa el sidebar en el layout
const Nav = styled.nav<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ $open }) => ($open ? SIDEBAR_OFFSET_OPEN : SIDEBAR_OFFSET_CLOSED)}px;
  padding: ${SIDEBAR_PADDING}px;
  display: flex;
  align-items: center;
  background: transparent;
  z-index: 100;
  transition: width 0.3s ease;

  @media ${bp.maxMd} {
    display: none;
  }
`

// el sidebar visual flotante con bordes redondeados
const SidebarInner = styled.div`
  width: 100%;
  height: 90vh;
  background: ${({ theme }) => theme.sidebar};
  border-radius: 30px;
  box-shadow: -2px 0px 4px rgba(0, 0, 0, 0.25), 4px 4px 2px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.sidebarBorder};
    border-radius: 4px;
  }
`

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
  min-height: 64px;
  overflow: hidden;
`

const LogoMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
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
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: 0.5rem auto;
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

// border-radius: 25px para el estilo pill del original
const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.65rem 1rem;
  margin: 0.125rem 0.75rem;
  border-radius: 25px;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
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
  padding: 0.25rem 0.75rem;
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

const Controls = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.25rem;
  justify-content: ${({ $open }) => ($open ? 'flex-start' : 'center')};
`

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.65rem 1rem;
  margin: 0 0.75rem;
  border-radius: 25px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  width: calc(100% - 1.5rem);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`
