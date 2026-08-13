import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Tema = 'claro' | 'oscuro'

interface UiStore {
  tema: Tema
  drawerMobile: boolean    // mobile: drawer open vs closed
  toggleTema: () => void
  toggleDrawer: () => void
  setDrawer: (abierto: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      tema: 'claro',
      drawerMobile: false,
      toggleTema: () =>
        set((s) => ({ tema: s.tema === 'claro' ? 'oscuro' : 'claro' })),
      toggleDrawer: () =>
        set((s) => ({ drawerMobile: !s.drawerMobile })),
      setDrawer: (abierto) => set({ drawerMobile: abierto }),
    }),
    { name: 'sga-ui' }
  )
)
