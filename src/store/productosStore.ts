import { create } from 'zustand'
import type { FiltrosProductos } from '@/types/productos'

interface ProductosState {
  busqueda: string
  filtros: FiltrosProductos
  setBusqueda: (v: string) => void
  setFiltros: (f: FiltrosProductos) => void
  resetFiltros: () => void
}

const filtrosInit: FiltrosProductos = { marca: '' }

export const useProductosStore = create<ProductosState>(set => ({
  busqueda: '',
  filtros: filtrosInit,
  setBusqueda: busqueda => set({ busqueda }),
  setFiltros: filtros => set({ filtros }),
  resetFiltros: () => set({ filtros: filtrosInit }),
}))
