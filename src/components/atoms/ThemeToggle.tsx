import styled from 'styled-components'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useUiStore } from '@/store/uiStore'
import { useTranslation } from 'react-i18next'

interface Props {
  showLabel?: boolean
}

export default function ThemeToggle({ showLabel }: Props) {
  const { tema, toggleTema } = useUiStore()
  const { t } = useTranslation()
  const isDark = tema === 'oscuro'

  return (
    <Btn
      onClick={toggleTema}
      title={t('tema.cambiar')}
      aria-label={t('tema.cambiar')}
    >
      {isDark ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
      {showLabel && (
        <Label>{isDark ? t('tema.claro') : t('tema.oscuro')}</Label>
      )}
    </Btn>
  )
}

const Btn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.sidebarText};
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.sidebarHover};
    color: ${({ theme }) => theme.sidebarTextActive};
  }
`

const Label = styled.span`
  font-size: 0.8125rem;
  font-weight: 500;
`
