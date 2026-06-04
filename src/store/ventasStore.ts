import { create } from 'zustand'
import type { FiltrosVentas } from '@/types/ventas'

interface VentasState {
  busqueda: string
  filtros: FiltrosVentas
  setBusqueda: (v: string) => void
  setFiltros: (f: Partial<FiltrosVentas>) => void
  resetFiltros: () => void
}

const filtrosIniciales: FiltrosVentas = {
  estado: '',
  marca: '',
}

export const useVentasStore = create<VentasState>(set => ({
  busqueda: '',
  filtros: filtrosIniciales,
  setBusqueda: v => set({ busqueda: v }),
  setFiltros: f => set(s => ({ filtros: { ...s.filtros, ...f } })),
  resetFiltros: () => set({ filtros: filtrosIniciales }),
}))
