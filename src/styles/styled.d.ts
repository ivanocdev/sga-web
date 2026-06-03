import 'styled-components'
import type { Theme } from './theme'

// hace que theme.* esté tipado en todos los componentes styled
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
