// @ts-nocheck — Deno runtime, URL imports y global Deno no los reconoce el tsconfig del proyecto
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    // cliente con service role — única forma de usar auth.admin.createUser
    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // verificar sesión del que llama
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: { user }, error: authErr } = await admin.auth.getUser(token)
    if (authErr || !user) {
      return json({ error: 'No autenticado' }, 401)
    }

    // solo admins pueden crear usuarios
    const { data: perfil } = await admin
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (perfil?.rol !== 'admin') return json({ error: 'Sin permisos de administrador' }, 403)

    const { nombre, correo, password, rol } = await req.json()

    // crear en Supabase Auth — email_confirm:true para saltar el flow de confirmación
    const { data: authData, error: createErr } = await admin.auth.admin.createUser({
      email: correo,
      password,
      email_confirm: true,
    })
    if (createErr) throw createErr

    // insertar perfil en la tabla usuarios
    const { error: insertErr } = await admin.from('usuarios').insert({
      id: authData.user.id,
      nombre,
      correo,
      rol,
      activo: true,
    })
    if (insertErr) throw insertErr

    return json({ ok: true })
  } catch (err) {
    return json({ error: (err as Error).message }, 400)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
