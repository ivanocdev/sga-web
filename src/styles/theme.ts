export interface Theme {
  bg: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  primary: string
  primaryHover: string
  primaryLight: string
  danger: string
  success: string
  warning: string
  // sidebar siempre oscuro, independiente del tema
  sidebar: string
  sidebarHover: string
  sidebarActive: string
  sidebarText: string
  sidebarTextActive: string
  sidebarBorder: string
  // inputs y formularios
  inputBg: string
  inputBorder: string
  inputFocus: string
  // sombras
  shadow: string
  shadowCard: string
  // sombra diagonal del diseño original: izquierda/arriba + derecha/abajo
  cardShadow: string
}

export const lightTheme: Theme = {
  bg: '#f7f9fd',            // bgtotalFuerte del original
  surface: '#ffffff',
  surfaceHover: '#f2f2f2',
  border: '#eaeaea',        // bg4 del original
  text: '#0f172a',
  textMuted: '#667085',     // textsecundario del original
  primary: '#2264E5',       // colorBotones del original
  primaryHover: '#023E8A',  // colorPrincipal del original
  primaryLight: 'rgba(34, 100, 229, 0.1)',
  danger: '#F54E41',        // colorError del original
  success: '#9046FF',       // colorExito del original — morado, no verde
  warning: '#d97706',
  // sidebar azul navy en light para que coincida con el color de marca
  sidebar: '#023E8A',
  sidebarHover: 'rgba(255, 255, 255, 0.1)',
  sidebarActive: 'rgba(255, 255, 255, 0.18)',
  sidebarText: 'rgba(255, 255, 255, 0.65)',
  sidebarTextActive: '#ffffff',
  sidebarBorder: 'rgba(255, 255, 255, 0.12)',
  inputBg: '#ffffff',
  inputBorder: '#9b9b9b',   // color del underline en el original
  inputFocus: '#2264E5',
  shadow: '0 1px 3px rgba(0,0,0,0.08)',
  shadowCard: '-4px 0px 4px -2px rgba(0,0,0,0.25), 2px 2px 4px 0px rgba(0,0,0,0.25)',
  cardShadow: '-4px 0px 4px -2px rgba(0,0,0,0.25), 2px 2px 4px 0px rgba(0,0,0,0.25)',
}

export const darkTheme: Theme = {
  bg: '#131F24',            // bgtotal del original — el teal-navy signature
  surface: '#171717',       // bgcards del original
  surfaceHover: '#2C2C2E',  // bg3 del original
  border: '#37464F',        // color2 del original
  text: '#ffffff',
  textMuted: '#8C9298',     // colortitlecard del original
  primary: '#2264E5',
  primaryHover: '#023E8A',
  primaryLight: 'rgba(34, 100, 229, 0.15)',
  danger: '#F54E41',
  success: '#9046FF',
  warning: '#f59e0b',
  // ligeramente más oscuro que bg para crear profundidad sutil
  sidebar: '#0e161a',       // bgtotalFuerte del original
  sidebarHover: 'rgba(255, 255, 255, 0.06)',
  sidebarActive: 'rgba(255, 255, 255, 0.1)',
  sidebarText: '#667085',
  sidebarTextActive: '#ffffff',
  sidebarBorder: 'rgba(255, 255, 255, 0.05)',
  inputBg: 'transparent',
  inputBorder: '#667085',
  inputFocus: '#2264E5',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  shadowCard: '-4px 0px 4px -2px rgba(0,0,0,0.45), 2px 2px 4px 0px rgba(0,0,0,0.45)',
  cardShadow: '-4px 0px 4px -2px rgba(0,0,0,0.45), 2px 2px 4px 0px rgba(0,0,0,0.45)',
}
