import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Usuario } from '@/types/auth'

interface AuthContextValue {
  session: Session | null
  usuario: Usuario | null
  loading: boolean
  signIn: (correo: string, contrasena: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // arranca en true para no flashear rutas protegidas antes de saber si hay sesión
  const [loading, setLoading] = useState(true)

  async function cargarUsuario(userId: string) {
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol, activo')
      .eq('id', userId)
      .single()
    setUsuario(data as Usuario | null)
    setLoading(false)
  }

  useEffect(() => {
    // onAuthStateChange dispara INITIAL_SESSION al montar — no necesitamos getSession aparte
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        await cargarUsuario(newSession.user.id)
      } else {
        setUsuario(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(correo: string, contrasena: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, usuario, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
