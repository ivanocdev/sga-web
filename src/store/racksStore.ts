import { create } from 'zustand'

interface RacksState {
  busqueda: string
  setBusqueda: (v: string) => void
}

export const useRacksStore = create<RacksState>(set => ({
  busqueda: '',
  setBusqueda: v => set({ busqueda: v }),
}))
