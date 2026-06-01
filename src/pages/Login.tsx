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
        <LogoPlaceholder>SGA</LogoPlaceholder>
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
  background: #f0f2f5;
`

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const LogoPlaceholder = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111;
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
  color: #444;
`

const Input = styled.input`
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`

const ErrorMsg = styled.p`
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0;
`

const Button = styled.button`
  margin-top: 0.25rem;
  padding: 0.65rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    background: #93c5fd;
    cursor: not-allowed;
  }
`
