import { css } from 'styled-components'
import { bp } from './breakpoints'

// helpers de flex para no repetir las 2-3 líneas de siempre
export const flex = {
  center: css`
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  between: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  start: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
  `,
  col: css`
    display: flex;
    flex-direction: column;
  `,
}

// estilos que solo corren en mobile (< 768)
export const onMobile = (styles: ReturnType<typeof css>) => css`
  @media ${bp.maxMd} {
    ${styles}
  }
`

// estilos que solo corren en desktop (>= 768)
export const onDesktop = (styles: ReturnType<typeof css>) => css`
  @media ${bp.md} {
    ${styles}
  }
`

// texto largo que no rompe el layout
export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

// card estándar del sistema
export const card = css`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadowCard};
`
