// sm: 640, md: 768, lg: 1024, xl: 1280
// uso: @media ${bp.md} { ... }
const size = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}

export const bp = {
  sm: `(min-width: ${size.sm}px)`,
  md: `(min-width: ${size.md}px)`,
  lg: `(min-width: ${size.lg}px)`,
  xl: `(min-width: ${size.xl}px)`,
  // para estilos que solo aplican en mobile/tablet
  maxSm: `(max-width: ${size.sm - 1}px)`,
  maxMd: `(max-width: ${size.md - 1}px)`,
  maxLg: `(max-width: ${size.lg - 1}px)`,
}
