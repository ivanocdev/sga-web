import { useState, useRef, useEffect } from 'react'
import { FiFilter, FiX } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useMarcas } from '@/hooks/useProductos'
import { useProductosStore } from '@/store/productosStore'

export function FiltroMarcas() {
  const { t } = useTranslation()
  const { data: marcas = [] } = useMarcas()
  const { filtros, setFiltros, resetFiltros } = useProductosStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const tieneFiltrro = filtros.marca !== ''

  // cierra el panel al hacer clic afuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function seleccionar(marcaId: string) {
    setFiltros({ marca: marcaId })
    setOpen(false)
  }

  function limpiar() {
    resetFiltros()
    setOpen(false)
  }

  return (
    <Wrapper ref={ref}>
      <FilterBtn
        $active={tieneFiltrro}
        onClick={() => setOpen(v => !v)}
        title={t('common.filtrar')}
      >
        <FiFilter size={15} />
        {tieneFiltrro && <Dot />}
      </FilterBtn>

      {open && (
        <Panel>
          <PanelHeader>
            <span>{t('productos.marca')}</span>
            <CloseBtn onClick={() => setOpen(false)}><FiX size={14} /></CloseBtn>
          </PanelHeader>

          <OptionList>
            <Option
              $selected={filtros.marca === ''}
              onClick={() => seleccionar('')}
            >
              {t('productos.todas_marcas')}
            </Option>

            {marcas.map(m => (
              <Option
                key={m.id}
                $selected={filtros.marca === String(m.id)}
                onClick={() => seleccionar(String(m.id))}
              >
                {m.nombre}
              </Option>
            ))}
          </OptionList>

          {tieneFiltrro && (
            <LimpiarBtn onClick={limpiar}>
              <FiX size={12} />
              {t('common.cancelar')} filtro
            </LimpiarBtn>
          )}
        </Panel>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
`

const FilterBtn = styled.button<{ $active: boolean }>`
  position: relative;
  height: 38px;
  width: 38px;
  border-radius: 8px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.primary : theme.inputBorder)};
  background: ${({ $active, theme }) => ($active ? theme.primaryLight : theme.inputBg)};
  color: ${({ $active, theme }) => ($active ? theme.primary : theme.textMuted)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.primary};
  }
`

const Dot = styled.span`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.danger};
  border: 2px solid ${({ theme }) => theme.surface};
`

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  min-width: 200px;
  z-index: 50;
  overflow: hidden;
`

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  padding: 2px;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.text};
  }
`

const OptionList = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: 0.375rem 0;
`

const Option = styled.button<{ $selected: boolean }>`
  width: 100%;
  text-align: left;
  background: ${({ $selected, theme }) => ($selected ? theme.primaryLight : 'transparent')};
  color: ${({ $selected, theme }) => ($selected ? theme.primary : theme.text)};
  border: none;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ $selected, theme }) => ($selected ? theme.primaryLight : theme.surfaceHover)};
  }
`

const LimpiarBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.danger};
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => `${theme.danger}12`};
  }
`
