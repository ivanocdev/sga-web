-- RLS: ventas, detalle_ventas, ayudantes_venta
-- Todos los autenticados pueden leer y escribir.
-- Excepción: eliminar ventas solo admin (operación irreversible).

-- ventas
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventas: lectura autenticados"
  ON ventas FOR SELECT TO authenticated USING (true);

CREATE POLICY "ventas: crear autenticados"
  ON ventas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ventas: actualizar autenticados"
  ON ventas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- delete solo admin — eliminar un pedido es irreversible
CREATE POLICY "ventas: eliminar solo admin"
  ON ventas FOR DELETE TO authenticated
  USING (public.get_mi_rol() = 'admin');

-- detalle_ventas
ALTER TABLE detalle_ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "detalle_ventas: lectura autenticados"
  ON detalle_ventas FOR SELECT TO authenticated USING (true);

CREATE POLICY "detalle_ventas: crear autenticados"
  ON detalle_ventas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "detalle_ventas: actualizar autenticados"
  ON detalle_ventas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "detalle_ventas: eliminar autenticados"
  ON detalle_ventas FOR DELETE TO authenticated USING (true);

-- ayudantes_venta
ALTER TABLE ayudantes_venta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ayudantes_venta: lectura autenticados"
  ON ayudantes_venta FOR SELECT TO authenticated USING (true);

CREATE POLICY "ayudantes_venta: crear autenticados"
  ON ayudantes_venta FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ayudantes_venta: actualizar autenticados"
  ON ayudantes_venta FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ayudantes_venta: eliminar autenticados"
  ON ayudantes_venta FOR DELETE TO authenticated USING (true);
