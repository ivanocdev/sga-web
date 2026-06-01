import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Falla en el arranque si faltan variables — mejor un error claro que un crash silencioso en runtime
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Revisa tu archivo .env (ver .env.example).',
  )
}

// Cliente singleton — una sola instancia compartida en toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
