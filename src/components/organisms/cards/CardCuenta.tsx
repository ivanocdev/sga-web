import { useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useEditarUsuario } from '@/hooks/useUsuarios'
import { useTranslation } from 'react-i18next'
import { FloatingInput } from '@/components/atoms/FloatingInput'

interface PasswordForm {
  nueva: string
  confirmar: string
}

export function CardCuenta() {
  const { t } = useTranslation()
  const { usuario, recargarUsuario } = useAuth()
  const { mutate: editar, isPending: editando } = useEditarUsuario()
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [cambiandoClave, setCambiandoClave] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>()

  if (!usuario) return null

  function iniciarEdicion() {
    setNuevoNombre(usuario!.nombre)
    setEditandoNombre(true)
  }

  function guardarNombre() {
    if (!nuevoNombre.trim() || nuevoNombre === usuario!.nombre) {
      setEditandoNombre(false)
      return
    }
    editar(
      { id: usuario!.id, values: { nombre: nuevoNombre.trim(), rol: usuario!.rol, activo: usuario!.activo } },
      {
        onSuccess: async () => {
          setEditandoNombre(false)
          // refrescar el contexto para que el sidebar muestre el nombre nuevo
          await recargarUsuario()
        },
      }
    )
  }

  async function onCambiarContrasena({ nueva }: PasswordForm) {
    const { error } = await supabase.auth.updateUser({ password: nueva })
    if (error) {
      void Swal.fire({ icon: 'error', title: 'Error', text: error.message })
    } else {
      void Swal.fire({ icon: 'success', title: '¡Contraseña actualizada!', timer: 2000, showConfirmButton: false })
      reset()
      setCambiandoClave(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('configuracion.cuenta')}</CardTitle>
      </CardHeader>

      <CardBody>
        <AvatarRow>
          <Avatar>{usuario.nombre.charAt(0).toUpperCase()}</Avatar>
          <AvatarInfo>
            <RolBadge $admin={usuario.rol === 'admin'}>{usuario.rol}</RolBadge>
            <Correo>{usuario.correo}</Correo>
          </AvatarInfo>
        </AvatarRow>

        <Divider />

        {/* nombre editable */}
        <FieldRow>
          <FieldLabel>Nombre</FieldLabel>
          {editandoNombre ? (
            <EditRow>
              <EditInput
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') guardarNombre(); if (e.key === 'Escape') setEditandoNombre(false) }}
                disabled={editando}
                autoFocus
              />
              <IconBtn onClick={guardarNombre} disabled={editando} title="Guardar">
                <FiCheck size={14} />
              </IconBtn>
              <IconBtn onClick={() => setEditandoNombre(false)} disabled={editando} title="Cancelar">
                <FiX size={14} />
              </IconBtn>
            </EditRow>
          ) : (
            <EditRow>
              <NombreText>{usuario.nombre}</NombreText>
              <IconBtn onClick={iniciarEdicion} title={t('common.editar')}>
                <FiEdit2 size={14} />
              </IconBtn>
            </EditRow>
          )}
        </FieldRow>

        <Divider />

        {/* contraseña */}
        {!cambiandoClave ? (
          <CambiarClaveBtn type="button" onClick={() => setCambiandoClave(true)}>
            {t('configuracion.cambiar_contrasena')}
          </CambiarClaveBtn>
        ) : (
          <PasswordForm onSubmit={handleSubmit(onCambiarContrasena)}>
            <FloatingInput
              label={t('configuracion.nueva_contrasena')}
              type="password"
              {...register('nueva', {
                required: t('errores.requerido'),
                minLength: { value: 8, message: t('errores.contrasena_corta') },
              })}
              disabled={isSubmitting}
              error={errors.nueva?.message}
            />

            <FloatingInput
              label={t('configuracion.confirmar_contrasena')}
              type="password"
              {...register('confirmar', {
                required: t('errores.requerido'),
                validate: v => v === watch('nueva') || t('errores.contrasenas_no_coinciden'),
              })}
              disabled={isSubmitting}
              error={errors.confirmar?.message}
            />

            <FormActions>
              <CancelFormBtn
                type="button"
                onClick={() => { reset(); setCambiandoClave(false) }}
                disabled={isSubmitting}
              >
                {t('common.cancelar')}
              </CancelFormBtn>
              <SubmitBtn type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.cargando') : t('configuracion.actualizar')}
              </SubmitBtn>
            </FormActions>
          </PasswordForm>
        )}
      </CardBody>
    </Card>
  )
}

const Card = styled.div`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadowCard};
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg};
`

const CardTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const CardBody = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const AvatarInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Correo = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textMuted};
`

const RolBadge = styled.span<{ $admin: boolean }>`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $admin, theme }) => ($admin ? `${theme.primary}22` : `${theme.success}22`)};
  color: ${({ $admin, theme }) => ($admin ? theme.primary : theme.success)};
  width: fit-content;
`

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 0;
`

const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const FieldLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const EditRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`

const NombreText = styled.span`
  flex: 1;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
`

const EditInput = styled.input`
  flex: 1;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  font-size: 0.875rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.inputFocus};
  }

  &:disabled {
    opacity: 0.6;
  }
`

const IconBtn = styled.button`
  background: transparent;
  border: none;
  padding: 0.3rem;
  border-radius: 5px;
  cursor: pointer;
  color: ${({ theme }) => theme.textMuted};
  display: flex;
  align-items: center;
  transition: background 0.15s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryLight};
    color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const CambiarClaveBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 0.5rem 0.875rem;
  font-size: 0.825rem;
  cursor: pointer;
  color: ${({ theme }) => theme.primary};
  font-weight: 500;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: ${({ theme }) => theme.primaryLight};
  }
`

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
`

const CancelFormBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 7px;
  padding: 0.4rem 0.875rem;
  font-size: 0.825rem;
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
  border-radius: 7px;
  padding: 0.4rem 1rem;
  font-size: 0.825rem;
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
