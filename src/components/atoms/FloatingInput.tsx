import styled from 'styled-components'

// El truco: placeholder=" " (espacio) activa :placeholder-shown cuando está vacío,
// lo que permite que el label suba/baje sin JS
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FloatingInput({ label, error, ...inputProps }: FloatingInputProps) {
  return (
    <Wrapper>
      <Input placeholder=" " {...inputProps} />
      <Label>{label}</Label>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Wrapper>
  )
}

interface FloatingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: React.ReactNode
}

// en select el label siempre está arriba porque siempre hay un valor visible
export function FloatingSelect({ label, error, children, ...selectProps }: FloatingSelectProps) {
  return (
    <Wrapper>
      <Select {...selectProps}>
        {children}
      </Select>
      <Label $alwaysUp>{label}</Label>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  padding-top: 20px;
  width: 100%;
`

const Input = styled.input`
  width: 100%;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.inputBorder};
  outline: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  padding: 6px 0;
  background: transparent;
  transition: border-color 0.2s;

  /* autofill — evita que el navegador ponga fondo blanco/amarillo */
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-background-clip: text;
    -webkit-text-fill-color: ${({ theme }) => theme.text};
    transition: background-color 5000s ease-in-out 0s;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.inputFocus};
  }

  /* cuando el campo tiene valor o está en foco, sube el label */
  &:focus ~ label,
  &:not(:placeholder-shown) ~ label {
    top: 0;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.inputFocus};
    font-weight: 600;
  }
`

const Select = styled.select`
  width: 100%;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.inputBorder};
  outline: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
  padding: 6px 0;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-bottom-color: ${({ theme }) => theme.inputFocus};
  }

  option {
    background: ${({ theme }) => theme.surface};
    color: ${({ theme }) => theme.text};
  }
`

const Label = styled.label<{ $alwaysUp?: boolean }>`
  position: absolute;
  left: 0;
  top: ${({ $alwaysUp }) => ($alwaysUp ? '0' : '26px')};
  font-size: ${({ $alwaysUp }) => ($alwaysUp ? '0.75rem' : '1rem')};
  color: ${({ theme, $alwaysUp }) => ($alwaysUp ? theme.inputFocus : theme.textMuted)};
  font-weight: ${({ $alwaysUp }) => ($alwaysUp ? '600' : '400')};
  pointer-events: none;
  transition: top 0.2s, font-size 0.2s, color 0.2s;
`

const ErrorMsg = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.danger};
`
