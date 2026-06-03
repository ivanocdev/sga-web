import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Tema = 'claro' | 'oscuro'

interface UiStore {
  tema: Tema
  sidebarAbierto: boolean  // desktop: expanded vs collapsed
  drawerMobile: boolean    // mobile: drawer open vs closed
  toggleTema: () => void
  toggleSidebar: () => void
  setSidebar: (abierto: boolean) => void
  toggleDrawer: () => void
  setDrawer: (abierto: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      tema: 'claro',
      sidebarAbierto: true,
      drawerMobile: false,
      toggleTema: () =>
        set((s) => ({ tema: s.tema === 'claro' ? 'oscuro' : 'claro' })),
      toggleSidebar: () =>
        set((s) => ({ sidebarAbierto: !s.sidebarAbierto })),
      setSidebar: (abierto) => set({ sidebarAbierto: abierto }),
      toggleDrawer: () =>
        set((s) => ({ drawerMobile: !s.drawerMobile })),
      setDrawer: (abierto) => set({ drawerMobile: abierto }),
    }),
    { name: 'sga-ui' }
  )
)
