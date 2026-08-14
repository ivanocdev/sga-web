-- Fix critico encontrado durante Bloque 12 (documentacion), corriendo el proyecto en vivo
-- con datos reales por primera vez.
--
-- Problema 1: al rol `authenticated` nunca se le habian otorgado los privilegios base de
-- tabla (GRANT). RLS restringe FILAS dentro de lo que el GRANT ya permite — sin el GRANT,
-- Postgres devuelve "permission denied" (42501) antes de siquiera evaluar las policies.
-- Esto afectaba a TODAS las tablas, no solo a las de este bloque.
--
-- Problema 2: a `marcas`, `categorias` y `modulos` les faltaba la policy de SELECT para
-- authenticated (documentado como ya hecho en PROMPTS.md Bloque 8, pero nunca se aplico
-- en este proyecto real). Por eso el dashboard se veia vacio y el sidebar mostraba todos
-- los modulos siempre (el fallback "si modulos no cargo, mostrar todo" se activaba
-- silenciosamente).
--
-- Correr este archivo una sola vez en un proyecto Supabase nuevo, junto con los demas
-- archivos de supabase/policies/.

grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

create policy "marcas select autenticados" on marcas
  for select to authenticated using (true);

create policy "categorias select autenticados" on categorias
  for select to authenticated using (true);

create policy "modulos select autenticados" on modulos
  for select to authenticated using (true);
