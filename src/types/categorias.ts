export interface Categoria {
  id: number
  nombre: string
  color: string | null
}

export interface CategoriaFormValues {
  nombre: string
  color: string
}
