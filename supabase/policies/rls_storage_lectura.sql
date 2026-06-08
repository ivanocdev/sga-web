-- Storage: políticas de lectura para buckets facturas e imagenes
-- storage.objects ya tiene RLS habilitado por defecto en Supabase

-- facturas (privado): solo usuarios autenticados pueden leer/descargar
CREATE POLICY "facturas: lectura autenticados"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'facturas');

-- imagenes (público): cualquiera puede leer (logos, avatares)
CREATE POLICY "imagenes: lectura publica"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'imagenes');
