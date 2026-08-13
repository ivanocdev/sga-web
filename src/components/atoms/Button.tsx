import styled, { css } from 'styled-components'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return <StyledButton $variant={variant} $size={size} {...props} />
}

// border-radius en píldora completa (999px) — igual al diseño original
const sizeStyles = {
  sm: css`
    padding: 0.4rem 1.1rem;
    font-size: 0.8rem;
    border-radius: 999px;
    border-bottom-width: 4px;
    &:active { border-bottom-width: 2px; }
  `,
  md: css`
    padding: 0.55rem 1.5rem;
    font-size: 0.875rem;
    border-radius: 999px;
    border-bottom-width: 5px;
    &:active { border-bottom-width: 2px; }
  `,
  lg: css`
    padding: 0.7rem 1.875rem;
    font-size: 1rem;
    border-radius: 999px;
    border-bottom-width: 6px;
    &:active { border-bottom-width: 2px; }
  `,
}

const StyledButton = styled.button<{ $variant: ButtonProps['variant']; $size: ButtonProps['size'] }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.08s, border-bottom-width 0.08s;

  /* efecto 3D: el border-bottom actúa como sombra inferior */
  border-bottom-style: solid;
  border-bottom-color: rgba(0, 0, 0, 0.25);

  &:active:not(:disabled) {
    transform: translateY(3px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  ${({ $size }) => sizeStyles[$size!]}

  ${({ $variant, theme }) =>
    $variant === 'primary' && css`
      background: ${theme.primary};
      color: #fff;
      &:hover:not(:disabled) { background: ${theme.primaryHover}; }
    `}

  ${({ $variant, theme }) =>
    $variant === 'secondary' && css`
      background: transparent;
      color: ${theme.textMuted};
      border: 1px solid ${theme.border};
      border-bottom-color: ${theme.border};
      &:hover:not(:disabled) { background: ${theme.surfaceHover}; }
    `}

  ${({ $variant, theme }) =>
    $variant === 'danger' && css`
      background: ${theme.danger};
      color: #fff;
      &:hover:not(:disabled) { filter: brightness(0.9); }
    `}
`
