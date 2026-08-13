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
  MdLogout,
} from 'react-icons/md'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useAuth } from '@/context/AuthContext'
import { useModulos } from '@/hooks/useModulos'
import { useUiStore } from '@/store/uiStore'
import { bp } from '@/styles/breakpoints'

export const SIDEBAR_W = 72
const SIDEBAR_PADDING = 16
// ancho total incluyendo el padding del wrapper flotante
export const SIDEBAR_OFFSET = SIDEBAR_W + SIDEBAR_PADDING * 2

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
  const { t, i18n } = useTranslation()
  const { usuario, signOut } = useAuth()
  const { data: modulos = [] } = useModulos()
  const { tema, toggleTema } = useUiStore()
  const navigate = useNavigate()
  const isEs = i18n.language.startsWith('es')
  const isDark = tema === 'oscuro'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function toggleIdioma() {
    i18n.changeLanguage(isEs ? 'en' : 'es')
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
    <Nav>
      <SidebarInner>
        <NavList>
          {items.map(({ key, path, icon: Icon, end }) => (
            <li key={key}>
              <Item to={path} end={end} title={t(`nav.${key}`)} aria-label={t(`nav.${key}`)}>
                <Icon size={20} />
              </Item>
            </li>
          ))}
        </NavList>

        <Footer>
          <IconBtn onClick={toggleIdioma} title="ES / EN" aria-label="Cambiar idioma">
            <LangLabel>{isEs ? 'ES' : 'EN'}</LangLabel>
          </IconBtn>
          <IconBtn onClick={toggleTema} title={t('tema.cambiar')} aria-label={t('tema.cambiar')}>
            {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </IconBtn>
          <IconBtn
            onClick={handleSignOut}
            title={t('nav.cerrarSesion')}
            aria-label={t('nav.cerrarSesion')}
          >
            <MdLogout size={18} />
          </IconBtn>
        </Footer>
      </SidebarInner>
    </Nav>
  )
}

// wrapper transparente — solo define el espacio que ocupa el sidebar en el layout
const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${SIDEBAR_OFFSET}px;
  padding: ${SIDEBAR_PADDING}px;
  display: flex;
  align-items: center;
  background: transparent;
  z-index: 100;

  @media ${bp.maxMd} {
    display: none;
  }
`

// la cápsula flotante angosta, solo íconos — como el diseño original
const SidebarInner = styled.div`
  width: ${SIDEBAR_W}px;
  height: 90vh;
  background: ${({ theme }) => theme.sidebarCapsule};
  border-radius: 999px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const NavList = styled.ul`
  list-style: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
`

const Item = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: ${({ theme }) => theme.sidebarCapsuleText};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarCapsuleHover};
  }

  &.active {
    color: ${({ theme }) => theme.sidebarCapsuleTextActive};
  }
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-top: 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.sidebarCapsuleBorder};
  width: 100%;
`

const IconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarCapsuleText};
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarCapsuleHover};
  }
`

const LangLabel = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
`
