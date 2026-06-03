import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { MdMenu } from 'react-icons/md'
import { useUiStore } from '@/store/uiStore'
import Sidebar, { SIDEBAR_W_OPEN, SIDEBAR_W_CLOSED } from '@/components/organisms/sidebar/Sidebar'
import SidebarMobile from '@/components/organisms/sidebar/SidebarMobile'
import ThemeToggle from '@/components/atoms/ThemeToggle'
import LanguageToggle from '@/components/atoms/LanguageToggle'
import { bp } from '@/styles/breakpoints'

const TOPBAR_H = 56

export default function MainLayout() {
  const { sidebarAbierto, toggleDrawer } = useUiStore()

  return (
    <Wrapper>
      <Sidebar />
      <SidebarMobile />

      {/* topbar fijo solo en mobile — en desktop el sidebar lo reemplaza */}
      <MobileTopBar>
        <HamburgerBtn onClick={toggleDrawer} aria-label="Abrir menú">
          <MdMenu size={24} />
        </HamburgerBtn>
        <MobileLogoMark>SGA</MobileLogoMark>
        <TopBarRight>
          <ThemeToggle />
          <LanguageToggle />
        </TopBarRight>
      </MobileTopBar>

      <Main $open={sidebarAbierto}>
        <Outlet />
      </Main>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`

const MobileTopBar = styled.header`
  display: none;

  @media ${bp.maxMd} {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: ${TOPBAR_H}px;
    padding: 0 1rem;
    background: ${({ theme }) => theme.sidebar};
    border-bottom: 1px solid ${({ theme }) => theme.sidebarBorder};
    z-index: 100;
  }
`

const HamburgerBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`

const MobileLogoMark = styled.div`
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
`

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const Main = styled.main<{ $open: boolean }>`
  flex: 1;
  min-width: 0;
  margin-left: ${({ $open }) => ($open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED)}px;
  padding: 1.5rem;
  transition: margin-left 0.25s ease;

  @media ${bp.maxMd} {
    margin-left: 0;
    padding: 1rem;
    padding-top: calc(${TOPBAR_H}px + 1rem);
  }
`
