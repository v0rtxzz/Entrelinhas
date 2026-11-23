-- =====================================================================
-- ENTRELINHAS · 04 · STORAGE (imagens das capas) — RNF12
-- ---------------------------------------------------------------------
-- Rode DEPOIS do 03_seguranca_rls.sql.
--
-- Cria o "bucket" público chamado  capas  no Supabase Storage.
--   * Qualquer pessoa pode VER as capas (para aparecer no site)
--   * Só a equipe (bibliotecária/admin) pode enviar, trocar ou apagar
--   * Limite de 2 MB e apenas imagens
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'capas',
  'capas',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "capas: todos podem ver" on storage.objects;
create policy "capas: todos podem ver"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'capas');

drop policy if exists "capas: equipe envia" on storage.objects;
create policy "capas: equipe envia"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'capas' and public.eh_equipe());

drop policy if exists "capas: equipe atualiza" on storage.objects;
create policy "capas: equipe atualiza"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'capas' and public.eh_equipe());

drop policy if exists "capas: equipe apaga" on storage.objects;
create policy "capas: equipe apaga"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'capas' and public.eh_equipe());
