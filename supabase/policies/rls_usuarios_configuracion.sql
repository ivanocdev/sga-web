-- RLS: usuarios, marcas, categorias, modulos
-- Documentado por primera vez en Bloque 12 — se habían aplicado manualmente contra el
-- proyecto real en bloques anteriores pero nunca se guardaron como script versionado.

-- usuarios: cada quien lee su propia fila, admin lee todas; solo admin edita/elimina
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios select"
  ON usuarios FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.get_mi_rol() = 'admin');

CREATE POLICY "usuarios update admin"
  ON usuarios FOR UPDATE TO authenticated
  USING (public.get_mi_rol() = 'admin')
  WITH CHECK (public.get_mi_rol() = 'admin');

CREATE POLICY "usuarios delete admin"
  ON usuarios FOR DELETE TO authenticated
  USING (public.get_mi_rol() = 'admin');

-- marcas: todos los autenticados leen, solo admin escribe
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marcas select autenticados"
  ON marcas FOR SELECT TO authenticated USING (true);

CREATE POLICY "marcas insert admin"
  ON marcas FOR INSERT TO authenticated
  WITH CHECK (public.get_mi_rol() = 'admin');

CREATE POLICY "marcas update admin"
  ON marcas FOR UPDATE TO authenticated
  USING (public.get_mi_rol() = 'admin');

CREATE POLICY "marcas delete admin"
  ON marcas FOR DELETE TO authenticated
  USING (public.get_mi_rol() = 'admin');

-- categorias: mismo patrón que marcas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias select autenticados"
  ON categorias FOR SELECT TO authenticated USING (true);

CREATE POLICY "categorias insert admin"
  ON categorias FOR INSERT TO authenticated
  WITH CHECK (public.get_mi_rol() = 'admin');

CREATE POLICY "categorias update admin"
  ON categorias FOR UPDATE TO authenticated
  USING (public.get_mi_rol() = 'admin');

CREATE POLICY "categorias delete admin"
  ON categorias FOR DELETE TO authenticated
  USING (public.get_mi_rol() = 'admin');

-- modulos: todos los autenticados leen (para filtrar el sidebar), solo admin activa/desactiva
-- no tiene policy de insert/delete porque los 7 modulos se crean una sola vez via seed.sql
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modulos select autenticados"
  ON modulos FOR SELECT TO authenticated USING (true);

CREATE POLICY "modulos update admin"
  ON modulos FOR UPDATE TO authenticated
  USING (public.get_mi_rol() = 'admin');
