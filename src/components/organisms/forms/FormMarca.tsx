import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { FiX } from 'react-icons/fi'
import { useInsertarMarca, useEditarMarca } from '@/hooks/useMarcas'
import type { Marca } from '@/types/productos'
import { FloatingInput } from '@/components/atoms/FloatingInput'
import Button from '@/components/atoms/Button'

interface Props {
  marca?: Marca
  onClose: () => void
}

export function FormMarca({ marca, onClose }: Props) {
  const { mutate: insertar, isPending: insertando } = useInsertarMarca()
  const { mutate: editar, isPending: editando } = useEditarMarca()
  const isPending = insertando || editando

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ nombre: string }>()

  useEffect(() => {
    reset({ nombre: marca?.nombre ?? '' })
  }, [marca, reset])

  function onSubmit({ nombre }: { nombre: string }) {
    if (marca) {
      editar({ id: marca.id, nombre }, { onSuccess: onClose })
    } else {
      insertar(nombre, { onSuccess: onClose })
    }
  }

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <h2>{marca ? 'Editar marca' : 'Nueva marca'}</h2>
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

          <Actions>
            <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar'}
            </Button>
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

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`

