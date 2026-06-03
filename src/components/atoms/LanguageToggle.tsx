import styled from 'styled-components'
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const isEs = i18n.language.startsWith('es')

  function toggle() {
    i18n.changeLanguage(isEs ? 'en' : 'es')
  }

  return (
    <Pill aria-label="Cambiar idioma">
      <Option $active={isEs} onClick={isEs ? undefined : toggle}>
        ES
      </Option>
      <Option $active={!isEs} onClick={!isEs ? undefined : toggle}>
        EN
      </Option>
    </Pill>
  )
}

const Pill = styled.div`
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.sidebarBorder};
`

const Option = styled.button<{ $active: boolean }>`
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $active, theme }) =>
    $active ? theme.primary : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? '#fff' : theme.sidebarText};
  border: none;
  cursor: ${({ $active }) => ($active ? 'default' : 'pointer')};
  transition: background 0.15s, color 0.15s;
  line-height: 1;

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) =>
      $active ? theme.primary : theme.sidebarHover};
    color: ${({ $active, theme }) =>
      $active ? '#fff' : theme.sidebarTextActive};
  }
`
