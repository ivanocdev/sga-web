-- schema.sql — esquema completo de la base de datos de sga-web
-- Generado con pg_dump --schema-only desde el proyecto Supabase real, limpiado a mano:
-- se quitan las policies de RLS (viven en supabase/policies/*.sql) y el event trigger
-- interno de conveniencia rls_auto_enable (no es necesario para levantar el proyecto).
--
-- Orden de ejecución en un proyecto Supabase nuevo:
--   1. este archivo (schema.sql)
--   2. supabase/policies/*.sql (en cualquier orden)
--   3. seed.sql (opcional, datos de ejemplo)

CREATE FUNCTION public.get_mi_rol() RETURNS text
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT rol FROM usuarios WHERE id = auth.uid()
$$;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ayudantes_venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ayudantes_venta (
    id bigint NOT NULL,
    venta_id bigint NOT NULL,
    usuario_id uuid NOT NULL,
    fecha_asignacion timestamp without time zone DEFAULT now()
);


--
-- Name: ayudantes_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ayudantes_venta ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ayudantes_venta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cajas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cajas (
    id bigint NOT NULL,
    producto_id bigint NOT NULL,
    cantidad bigint,
    fecha_caducidad date,
    rack_id bigint,
    fecha_entrada timestamp without time zone DEFAULT now(),
    codigo_barras text
);


--
-- Name: cajas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cajas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cajas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categorias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorias (
    id bigint NOT NULL,
    nombre text NOT NULL,
    color text,
    icono text DEFAULT '-'::text
);


--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.categorias ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: detalle_ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_ventas (
    id bigint NOT NULL,
    venta_id bigint NOT NULL,
    producto_id bigint,
    cantidad bigint,
    fecha_caducidad date,
    ubicacion text,
    estado text DEFAULT 'incompleto'::text,
    escaneado bigint
);


--
-- Name: detalle_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.detalle_ventas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.detalle_ventas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: marcas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.marcas (
    id bigint NOT NULL,
    nombre text NOT NULL,
    logo text
);


--
-- Name: marcas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.marcas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.marcas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: modulos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modulos (
    id bigint NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT false,
    descripcion text,
    icono text,
    link text
);


--
-- Name: modulos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.modulos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.modulos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pendientes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pendientes (
    id bigint NOT NULL,
    producto_id bigint NOT NULL,
    cantidad bigint NOT NULL,
    fecha_caducidad date,
    codigo_barras text,
    ubicacion text NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now(),
    usuario_id uuid
);


--
-- Name: pendientes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pendientes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pendientes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: piso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piso (
    id bigint NOT NULL,
    producto_id bigint NOT NULL,
    cantidad bigint,
    fecha_caducidad date,
    codigo_barras text
);


--
-- Name: piso_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.piso ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.piso_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: productos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.productos (
    id bigint NOT NULL,
    codigo bigint NOT NULL,
    nombre text,
    marca_id bigint,
    cajas bigint,
    cantidad bigint,
    racks bigint
);


--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.productos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.productos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: racks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.racks (
    id bigint NOT NULL,
    marca_id bigint,
    nivel text,
    posicion text,
    lado text,
    ocupado boolean DEFAULT false,
    codigo_rack text
);


--
-- Name: racks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.racks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.racks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: suelto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suelto (
    id bigint NOT NULL,
    producto_id bigint,
    cantidad bigint,
    fecha_caducidad date,
    fecha_entrada timestamp with time zone DEFAULT now(),
    codigo_barras text
);


--
-- Name: suelto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.suelto ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.suelto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid NOT NULL,
    nombre text NOT NULL,
    correo text NOT NULL,
    rol text DEFAULT 'operador'::text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    CONSTRAINT usuarios_rol_check CHECK ((rol = ANY (ARRAY['admin'::text, 'operador'::text])))
);


--
-- Name: ventas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventas (
    id bigint NOT NULL,
    marca_id bigint NOT NULL,
    cantidad_productos bigint,
    cantidad_total bigint,
    fecha timestamp without time zone,
    codigo text,
    factura_url text,
    estado text DEFAULT 'incompleto'::text,
    usuario uuid
);


--
-- Name: ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ventas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ventas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ayudantes_venta ayudantes_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ayudantes_venta
    ADD CONSTRAINT ayudantes_venta_pkey PRIMARY KEY (id);


--
-- Name: cajas cajas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT cajas_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: detalle_ventas detalle_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_pkey PRIMARY KEY (id);


--
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: pendientes pendientes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pendientes
    ADD CONSTRAINT pendientes_pkey PRIMARY KEY (id);


--
-- Name: piso piso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piso
    ADD CONSTRAINT piso_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: racks racks_codigo_rack_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT racks_codigo_rack_key UNIQUE (codigo_rack);


--
-- Name: racks racks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT racks_pkey PRIMARY KEY (id);


--
-- Name: suelto suelto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suelto
    ADD CONSTRAINT suelto_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ventas ventas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_codigo_key UNIQUE (codigo);


--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (id);


--
-- Name: ayudantes_venta ayudantes_venta_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ayudantes_venta
    ADD CONSTRAINT ayudantes_venta_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- Name: ayudantes_venta ayudantes_venta_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ayudantes_venta
    ADD CONSTRAINT ayudantes_venta_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id);


--
-- Name: cajas cajas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT cajas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: cajas cajas_rack_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT cajas_rack_id_fkey FOREIGN KEY (rack_id) REFERENCES public.racks(id);


--
-- Name: detalle_ventas detalle_ventas_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: detalle_ventas detalle_ventas_venta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_ventas
    ADD CONSTRAINT detalle_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id);


--
-- Name: pendientes pendientes_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pendientes
    ADD CONSTRAINT pendientes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: piso piso_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piso
    ADD CONSTRAINT piso_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: productos productos_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id);


--
-- Name: productos productos_racks_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_racks_fkey FOREIGN KEY (racks) REFERENCES public.racks(id);


--
-- Name: racks racks_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.racks
    ADD CONSTRAINT racks_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id);


--
-- Name: suelto suelto_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suelto
    ADD CONSTRAINT suelto_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id);


--
-- Name: usuarios usuarios_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ventas ventas_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id);


--
-- Name: ventas ventas_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_usuario_fkey FOREIGN KEY (usuario) REFERENCES public.usuarios(id);

