import { useState, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
}

// dispara onSearch después de que el usuario deja de escribir
export function SearchInput({ onSearch, placeholder, delay = 350 }: Props) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay, onSearch])

  return (
    <Wrapper>
      <FiSearch />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder ?? t('common.buscar')}
      />
      {value && (
        <ClearBtn onClick={() => setValue('')} title="Limpiar">
          <FiX size={14} />
        </ClearBtn>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  padding: 0 0.75rem;
  height: 38px;
  min-width: 200px;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: ${({ theme }) => theme.inputFocus};
  }

  svg:first-child {
    color: ${({ theme }) => theme.textMuted};
    flex-shrink: 0;
  }

  input {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 0.875rem;
    outline: none;
    width: 100%;

    &::placeholder {
      color: ${({ theme }) => theme.textMuted};
    }
  }
`

const ClearBtn = styled.button`
  background: transparent;
  border: none;
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  align-items: center;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`
