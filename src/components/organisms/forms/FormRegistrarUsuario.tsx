import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { FiX } from 'react-icons/fi'
import { useCrearUsuario } from '@/hooks/useUsuarios'
import { reglas } from '@/utils/validaciones'
import type { UsuarioRegistroValues } from '@/types/usuarios'

interface Props {
  onClose: () => void
}

export function FormRegistrarUsuario({ onClose }: Props) {
  const { t } = useTranslation()
  const { mutate: crear, isPending } = useCrearUsuario()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioRegistroValues>({ defaultValues: { rol: 'operador' } })

  function onSubmit(values: UsuarioRegistroValues) {
    crear(values, { onSuccess: onClose })
  }

  return (
    <Overlay>
      <Modal>
        <ModalHeader>
          <h2>{t('usuarios.agregar')}</h2>
          <CloseBtn type="button" onClick={onClose} disabled={isPending}>
            <FiX size={18} />
          </CloseBtn>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <Label>{t('usuarios.nombre')}</Label>
            <Input
              {...register('nombre', { required: t('errores.requerido'), ...reglas.nombre })}
              placeholder="Nombre completo"
              disabled={isPending}
            />
            {errors.nombre && <ErrorMsg>{errors.nombre.message}</ErrorMsg>}
          </Field>

          <Field>
            <Label>{t('usuarios.correo')}</Label>
            <Input
              type="email"
              {...register('correo', {
                required: t('errores.requerido'),
                ...reglas.correo,
              })}
              placeholder="correo@ejemplo.com"
              disabled={isPending}
            />
            {errors.correo && <ErrorMsg>{errors.correo.message}</ErrorMsg>}
          </Field>

          <Field>
            <Label>Contraseña</Label>
            <Input
              type="password"
              {...register('password', {
                required: t('errores.requerido'),
                ...reglas.password,
              })}
              placeholder="Mínimo 8 caracteres"
              disabled={isPending}
            />
            {errors.password && <ErrorMsg>{errors.password.message}</ErrorMsg>}
          </Field>

          <Field>
            <Label>{t('usuarios.rol')}</Label>
            <Select
              {...register('rol', { required: t('errores.requerido') })}
              disabled={isPending}
            >
              <option value="operador">Operador</option>
              <option value="admin">Admin</option>
            </Select>
            {errors.rol && <ErrorMsg>{errors.rol.message}</ErrorMsg>}
          </Field>

          <Actions>
            <CancelBtn type="button" onClick={onClose} disabled={isPending}>
              {t('common.cancelar')}
            </CancelBtn>
            <SubmitBtn type="submit" disabled={isPending}>
              {isPending ? t('common.cargando') : t('common.guardar')}
            </SubmitBtn>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  )
}

// --- estilos ---

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
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
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
    color: ${({ theme }) => theme.text};
  }

  &:disabled {
    opacity: 0.5;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
  padding: 1.5rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const Label = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const inputBase = `
  border-radius: 8px;
  border: 1px solid;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: var(--focus);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Input = styled.input`
  ${inputBase}
  background: ${({ theme }) => theme.inputBg};
  border-color: ${({ theme }) => theme.inputBorder};
  color: ${({ theme }) => theme.text};
  --focus: ${({ theme }) => theme.inputFocus};

  &::placeholder {
    color: ${({ theme }) => theme.textMuted};
  }
`

const Select = styled.select`
  ${inputBase}
  background: ${({ theme }) => theme.inputBg};
  border-color: ${({ theme }) => theme.inputBorder};
  color: ${({ theme }) => theme.text};
  --focus: ${({ theme }) => theme.inputFocus};
  cursor: pointer;
`

const ErrorMsg = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.danger};
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
`

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.5rem 1.125rem;
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
  padding: 0.5rem 1.25rem;
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
