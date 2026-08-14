-- seed.sql — datos demo para desarrollo local de sga-web
--
-- Pensado para correrse UNA vez, contra un proyecto Supabase recién creado (sin datos
-- previos en marcas/categorias/racks/productos/modulos), desde el SQL Editor de Supabase.
-- Usa variables PL/pgSQL en vez de IDs fijos para no depender de en qué número empiecen
-- las secuencias autoincrementales.
--
-- Requisito: ya debe existir al menos un usuario en la tabla `usuarios` (se crea
-- automáticamente la primera vez que inicias sesión en la app con Supabase Auth). Si no
-- hay ninguno todavía, el bloque de ventas se salta con un aviso — corré el resto del
-- seed, inicia sesión una vez, y volvé a correr este archivo para tener también pedidos
-- de ejemplo en el dashboard.

do $$
declare
  v_jumex          bigint;
  v_costena        bigint;
  v_alimentos      bigint;
  v_rack_jumex_1    bigint;
  v_rack_jumex_2    bigint;
  v_rack_costena_1  bigint;
  v_prod_jumex_1    bigint;
  v_prod_jumex_2    bigint;
  v_prod_costena_1  bigint;
  v_prod_alimentos_1 bigint;
  v_usuario        uuid;
  v_venta_1        bigint;
  v_venta_2        bigint;
begin
  -- módulos del sidebar
  insert into modulos (nombre, activo, descripcion, icono, link) values
    ('Dashboard',     true, 'Panel principal con métricas y gráficas', 'dashboard', '/'),
    ('Almacén',       true, 'Gestión de productos e inventario',       'warehouse', '/almacen'),
    ('Racks',         true, 'Gestión de racks de almacén',             'grid',      '/almacen/racks'),
    ('Ventas',        true, 'Pedidos de entrada de mercancía',         'receipt',   '/ventas'),
    ('Categorías',    true, 'Categorías de productos',                 'category',  '/categorias'),
    ('Usuarios',      true, 'Gestión de usuarios del sistema',         'people',    '/usuarios'),
    ('Configuración', true, 'Cuenta, marcas y módulos',                'settings',  '/configuracion');

  -- marcas
  insert into marcas (nombre) values ('JUMEX') returning id into v_jumex;
  insert into marcas (nombre) values ('LA COSTEÑA') returning id into v_costena;
  insert into marcas (nombre) values ('CON ALIMENTOS') returning id into v_alimentos;

  -- categorías
  insert into categorias (nombre, color) values
    ('Jugos', '#2264E5'),
    ('Enlatados', '#9046FF'),
    ('Snacks', '#F54E41'),
    ('Bebidas', '#22C55E');

  -- racks — uno ocupado y uno libre por marca, para ver el badge de estado en la tabla
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_jumex, 'A', '1', 'Izquierdo', true, 'A1-JUMEX') returning id into v_rack_jumex_1;
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_jumex, 'A', '2', 'Derecho', false, 'A2-JUMEX') returning id into v_rack_jumex_2;
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_costena, 'B', '1', 'Izquierdo', true, 'B1-COSTENA') returning id into v_rack_costena_1;
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_costena, 'B', '2', 'Derecho', false, 'B2-COSTENA');
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_alimentos, 'C', '1', 'Izquierdo', true, 'C1-ALIMENTOS');
  insert into racks (marca_id, nivel, posicion, lado, ocupado, codigo_rack)
    values (v_alimentos, 'C', '2', 'Derecho', false, 'C2-ALIMENTOS');

  -- productos
  insert into productos (codigo, nombre, marca_id, cajas, cantidad, racks)
    values (100492, 'Bida Cartón 12/946ml Uva', v_jumex, 80, 0, v_rack_jumex_1)
    returning id into v_prod_jumex_1;
  insert into productos (codigo, nombre, marca_id, cajas, cantidad, racks)
    values (100136, 'Único Fresco Tetra 12/960ml Manzana', v_jumex, 80, 20, v_rack_jumex_2)
    returning id into v_prod_jumex_2;
  insert into productos (codigo, nombre, marca_id, cajas, cantidad)
    values (200301, 'Frijoles Refritos 24/430g', v_costena, 24, 15)
    returning id into v_prod_costena_1;
  insert into productos (codigo, nombre, marca_id, cajas, cantidad)
    values (300150, 'Puré de Tomate 12/800g', v_alimentos, 12, 30)
    returning id into v_prod_alimentos_1;
  insert into productos (codigo, nombre, marca_id, cajas, cantidad) values
    (100138, 'Único Fresco Tetra 12/960ml Granada', v_jumex, 80, 10),
    (200302, 'Chiles Jalapeños 24/380g', v_costena, 24, 8);

  -- cajas — fechas de caducidad variadas para poblar el card "Próximos a caducar"
  insert into cajas (producto_id, cantidad, fecha_caducidad, rack_id, codigo_barras) values
    (v_prod_jumex_1, 80, current_date + interval '10 days', v_rack_jumex_1, '750100492001'),
    (v_prod_jumex_1, 80, current_date + interval '90 days', v_rack_jumex_1, '750100492002'),
    (v_prod_costena_1, 24, current_date + interval '5 days', v_rack_costena_1, '750200301001');

  -- piso y suelto
  insert into piso (producto_id, cantidad, fecha_caducidad, codigo_barras) values
    (v_prod_jumex_2, 20, current_date + interval '45 days', '750100136001'),
    (v_prod_alimentos_1, 30, current_date + interval '60 days', '750300150001');

  insert into suelto (producto_id, cantidad, fecha_caducidad, codigo_barras) values
    (v_prod_costena_1, 15, current_date + interval '20 days', '750200301002');

  -- ventas (pedidos de entrada) — usa el primer usuario que exista
  select id into v_usuario from usuarios limit 1;

  if v_usuario is not null then
    insert into ventas (marca_id, cantidad_productos, cantidad_total, fecha, codigo, estado, usuario)
      values (v_jumex, 2, 100, now() - interval '3 days', 'DEMO-0001', 'Normal', v_usuario)
      returning id into v_venta_1;
    insert into ventas (marca_id, cantidad_productos, cantidad_total, fecha, codigo, estado, usuario)
      values (v_costena, 1, 24, now() - interval '1 day', 'DEMO-0002', 'Normal', v_usuario)
      returning id into v_venta_2;

    insert into detalle_ventas (venta_id, producto_id, cantidad, fecha_caducidad, ubicacion) values
      (v_venta_1, v_prod_jumex_1, 80, current_date + interval '10 days', 'Rack A1'),
      (v_venta_1, v_prod_jumex_2, 20, current_date + interval '45 days', 'Piso'),
      (v_venta_2, v_prod_costena_1, 24, current_date + interval '5 days', 'Rack B1');
  else
    raise notice 'No hay usuarios en la tabla usuarios — se omitió el seed de ventas. Inicia sesión en la app una vez y volvé a correr este archivo.';
  end if;
end $$;
