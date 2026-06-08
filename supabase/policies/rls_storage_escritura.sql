-- Storage: políticas de escritura para buckets facturas e imagenes

-- facturas: solo autenticados pueden subir, solo admin puede eliminar
CREATE POLICY "facturas: subir autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'facturas');

CREATE POLICY "facturas: actualizar autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'facturas')
  WITH CHECK (bucket_id = 'facturas');

-- eliminar facturas solo admin — una factura borrada no se recupera
CREATE POLICY "facturas: eliminar solo admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'facturas' AND public.get_mi_rol() = 'admin');

-- imagenes: autenticados pueden subir y actualizar, admin elimina
CREATE POLICY "imagenes: subir autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'imagenes');

CREATE POLICY "imagenes: actualizar autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'imagenes')
  WITH CHECK (bucket_id = 'imagenes');

CREATE POLICY "imagenes: eliminar solo admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'imagenes' AND public.get_mi_rol() = 'admin');
