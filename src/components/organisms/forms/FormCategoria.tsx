import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { FiX } from 'react-icons/fi'
import { useInsertarCategoria, useEditarCategoria } from '@/hooks/useCategorias'
import type { Categoria, CategoriaFormValues } from '@/types/categorias'
import { FloatingInput } from '@/components/atoms/FloatingInput'

interface Props {
  categoria?: Categoria
  onClose: () => void
}

export function FormCategoria({ categoria, onClose }: Props) {
  const { mutate: insertar, isPending: insertando } = useInsertarCategoria()
  const { mutate: editar, isPending: editando } = useEditarCategoria()
  const isPending = insertando || editando

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoriaFormValues>()

  useEffect(() => {
    reset({
      nombre: categoria?.nombre ?? '',
      color: categoria?.color ?? '#3b82f6',
    })
  }, [categoria, reset])

  function onSubmit(values: CategoriaFormValues) {
    if (categoria) {
      editar({ id: categoria.id, values }, { onSuccess: onClose })
    } else {
      insertar(values, { onSuccess: onClose })
    }
  }

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <h2>{categoria ? 'Editar categoría' : 'Nueva categoría'}</h2>
          <CloseBtn type="button" onClick={onClose} disabled={isPending}>
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FloatingInput
            label="Nombre"
            {...register('nombre', { required: 'El nombre es requerido' })}
            disabled={isPending}
            autoFocus
            error={errors.nombre?.message}
          />

          <ColorField>
            <ColorLabel>Color</ColorLabel>
            <ColorRow>
              <ColorInput type="color" {...register('color')} disabled={isPending} />
              <ColorHint>Color de identificación (opcional)</ColorHint>
            </ColorRow>
          </ColorField>

          <Actions>
            <CancelBtn type="button" onClick={onClose} disabled={isPending}>
              Cancelar
            </CancelBtn>
            <SubmitBtn type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </SubmitBtn>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  )
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const Modal = styled.div`
  background: ${({ theme }) => theme.surface};
  border-radius: 14px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  width: 100%;
  max-width: 380px;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.125rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  h2 {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text};
    margin: 0;
  }
`

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  padding: 0.35rem;
  border-radius: 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  align-items: center;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`

const ColorField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const ColorLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.inputFocus};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const ColorInput = styled.input`
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  padding: 0.2rem;
  background: ${({ theme }) => theme.inputBg};
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ColorHint = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SubmitBtn = styled.button`
  background: ${({ theme }) => theme.primary};
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
