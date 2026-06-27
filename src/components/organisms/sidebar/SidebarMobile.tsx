import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  MdLogout,
  MdClose,
} from 'react-icons/md'
import { useAuth } from '@/context/AuthContext'
import { useUiStore } from '@/store/uiStore'
import { useModulos } from '@/hooks/useModulos'

const DRAWER_W = 280

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

export default function SidebarMobile() {
  const { t } = useTranslation()
  const { usuario, signOut } = useAuth()
  const { drawerMobile, setDrawer } = useUiStore()
  const { data: modulos = [] } = useModulos()
  const navigate = useNavigate()
  const location = useLocation()

  // cerrar drawer al navegar — no afecta el estado del sidebar desktop
  useEffect(() => {
    setDrawer(false)
  }, [location.pathname, setDrawer])

  // bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerMobile])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const activosPaths = modulos.length > 0
    ? new Set(modulos.filter(m => m.activo).map(m => m.link))
    : null

  const items = NAV_ITEMS.filter(item =>
    (!item.adminOnly || usuario?.rol === 'admin') &&
    (activosPaths === null || activosPaths.has(item.path))
  )

  return (
    <>
      <Overlay $visible={drawerMobile} onClick={() => setDrawer(false)} />
      <Drawer $open={drawerMobile}>
        <DrawerHeader>
          <LogoArea>
            <LogoMark>SGA</LogoMark>
            <LogoText>Almacén</LogoText>
          </LogoArea>
          <CloseBtn onClick={() => setDrawer(false)} aria-label="Cerrar menú">
            <MdClose size={22} />
          </CloseBtn>
        </DrawerHeader>

        <NavList>
          {items.map(({ key, path, icon: Icon, end }) => (
            <li key={key}>
              <Item to={path} end={end}>
                <Icon size={20} />
                <span>{t(`nav.${key}`)}</span>
              </Item>
            </li>
          ))}
        </NavList>

        <Footer>
          {usuario && (
            <UserInfo>
              <UserName>{usuario.nombre}</UserName>
              <UserRole>{usuario.rol}</UserRole>
            </UserInfo>
          )}
          <LogoutBtn onClick={handleSignOut}>
            <MdLogout size={18} />
            <span>{t('nav.cerrarSesion')}</span>
          </LogoutBtn>
        </Footer>
      </Drawer>
    </>
  )
}

const Overlay = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 767px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 110;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? 'all' : 'none')};
    transition: opacity 0.25s ease;
  }
`

const Drawer = styled.aside<{ $open: boolean }>`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: ${DRAWER_W}px;
    max-width: 85vw;
    background: ${({ theme }) => theme.sidebar};
    z-index: 120;
    transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
    transition: transform 0.25s ease;
  }
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  min-height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.sidebarBorder};
`

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
`

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => theme.sidebarHover};
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarActive};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`

const NavList = styled.ul`
  list-style: none;
  flex: 1;
  padding: 0.5rem 0;
  overflow-y: auto;
`

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1.25rem;
  margin: 0.125rem 0.75rem;
  border-radius: 25px;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: uppercase;
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
`

const UserName = styled.p`
  color: ${({ theme }) => theme.sidebarTextActive};
  font-size: 0.875rem;
  font-weight: 600;
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
  padding: 0.75rem 1.25rem;
  margin: 0 0.75rem;
  border-radius: 25px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  font-size: 0.9375rem;
  font-weight: 600;
  text-transform: uppercase;
  width: calc(100% - 1.5rem);
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`
