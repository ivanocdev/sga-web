import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!correo.trim() || !contrasena) {
      setError(t('errores.requerido'))
      return
    }

    setCargando(true)
    try {
      await signIn(correo.trim(), contrasena)
      navigate('/')
    } catch {
      setError(t('errores.credenciales'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <Wrapper>
      <Card>
        {/* logo va aquí cuando el usuario suba sga_logo.svg a public/ */}
        <LogoMark>SGA</LogoMark>
        <Title>{t('auth.bienvenido')}</Title>

        <Form onSubmit={handleSubmit} noValidate>
          <Field>
            <Label htmlFor="correo">{t('auth.correo')}</Label>
            <Input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={cargando}
              autoComplete="email"
            />
          </Field>

          <Field>
            <Label htmlFor="contrasena">{t('auth.contrasena')}</Label>
            <Input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              disabled={cargando}
              autoComplete="current-password"
            />
          </Field>

          {error && <ErrorMsg role="alert">{error}</ErrorMsg>}

          <Button type="submit" disabled={cargando}>
            {cargando ? t('auth.cargando') : t('auth.iniciarSesion')}
          </Button>
        </Form>
      </Card>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg};
`

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadowCard};
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const LogoMark = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  margin: 0 0 1.25rem;
`

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textMuted};
`

const Input = styled.input`
  padding: 0.6rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 6px;
  font-size: 0.9375rem;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: ${({ theme }) => theme.inputFocus};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMsg = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.danger};
  margin: 0;
`

const Button = styled.button`
  margin-top: 0.25rem;
  padding: 0.65rem;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
