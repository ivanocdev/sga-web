-- RLS: racks, productos, cajas, piso, suelto, pendientes
-- Todos los usuarios autenticados pueden leer y escribir.
-- Excepción: eliminar racks solo admin (cambio estructural del almacén).

-- racks
ALTER TABLE racks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "racks: lectura autenticados"
  ON racks FOR SELECT TO authenticated USING (true);

CREATE POLICY "racks: crear autenticados"
  ON racks FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "racks: actualizar autenticados"
  ON racks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- delete solo admin porque es un cambio estructural del almacén
CREATE POLICY "racks: eliminar solo admin"
  ON racks FOR DELETE TO authenticated
  USING (public.get_mi_rol() = 'admin');

-- productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos: lectura autenticados"
  ON productos FOR SELECT TO authenticated USING (true);

CREATE POLICY "productos: crear autenticados"
  ON productos FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "productos: actualizar autenticados"
  ON productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "productos: eliminar autenticados"
  ON productos FOR DELETE TO authenticated USING (true);

-- cajas
ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cajas: lectura autenticados"
  ON cajas FOR SELECT TO authenticated USING (true);

CREATE POLICY "cajas: crear autenticados"
  ON cajas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "cajas: actualizar autenticados"
  ON cajas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "cajas: eliminar autenticados"
  ON cajas FOR DELETE TO authenticated USING (true);

-- piso
ALTER TABLE piso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "piso: lectura autenticados"
  ON piso FOR SELECT TO authenticated USING (true);

CREATE POLICY "piso: crear autenticados"
  ON piso FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "piso: actualizar autenticados"
  ON piso FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "piso: eliminar autenticados"
  ON piso FOR DELETE TO authenticated USING (true);

-- suelto
ALTER TABLE suelto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suelto: lectura autenticados"
  ON suelto FOR SELECT TO authenticated USING (true);

CREATE POLICY "suelto: crear autenticados"
  ON suelto FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "suelto: actualizar autenticados"
  ON suelto FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "suelto: eliminar autenticados"
  ON suelto FOR DELETE TO authenticated USING (true);

-- pendientes
ALTER TABLE pendientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pendientes: lectura autenticados"
  ON pendientes FOR SELECT TO authenticated USING (true);

CREATE POLICY "pendientes: crear autenticados"
  ON pendientes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pendientes: actualizar autenticados"
  ON pendientes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "pendientes: eliminar autenticados"
  ON pendientes FOR DELETE TO authenticated USING (true);
