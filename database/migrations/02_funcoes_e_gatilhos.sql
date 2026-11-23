-- =====================================================================
-- ENTRELINHAS · 02 · FUNÇÕES E GATILHOS (triggers)
-- ---------------------------------------------------------------------
-- Rode DEPOIS do 01_tabelas.sql.
--
-- O que tem aqui:
--   1. Funções de permissão usadas nas políticas RLS (arquivo 03)
--   2. Criação automática do perfil quando alguém se cadastra (RF01)
--   3. Proteção: usuário comum não consegue se promover a admin
--   4. Recalcular média de estrelas a cada voto (RF24)
--   5. Atualizar updated_at automaticamente
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. FUNÇÕES DE PERMISSÃO
-- "security definer" = a função roda com permissão do dono, então ela
-- consegue ler a tabela perfis mesmo com RLS ligada (evita recursão).
-- ---------------------------------------------------------------------

-- Cargo do usuário logado ('usuario' | 'bibliotecaria' | 'admin') ou null
create or replace function public.cargo_atual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select cargo
    from public.perfis
   where id = auth.uid()
     and ativo = true;
$$;

-- Usuário logado e com a conta ativa?
create or replace function public.usuario_ativo()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select ativo from public.perfis where id = auth.uid()),
    false
  );
$$;

-- Bibliotecária ou admin? (a "equipe" da biblioteca)
create or replace function public.eh_equipe()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.cargo_atual() in ('bibliotecaria', 'admin'), false);
$$;

-- Admin?
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.cargo_atual() = 'admin', false);
$$;


-- Nome e avatar de uma lista de usuários (para mostrar quem escreveu
-- cada resenha). Devolve SÓ dados públicos — nunca e-mail ou turma.
create or replace function public.perfis_publicos(ids uuid[])
returns table (id uuid, nome varchar, avatar_avela varchar, cargo varchar)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.nome, p.avatar_avela, p.cargo
    from public.perfis p
   where p.id = any(ids);
$$;

grant execute on function public.perfis_publicos(uuid[]) to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. CRIAR PERFIL AUTOMATICAMENTE NO CADASTRO (RF01)
-- O front-end envia nome e turma_unidade em "options.data" do signUp.
-- Todo mundo nasce com cargo 'usuario'.
-- ---------------------------------------------------------------------
create or replace function public.criar_perfil_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, email, turma_unidade)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), split_part(new.email, '@', 1)),
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'turma_unidade'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_novo_usuario();


-- ---------------------------------------------------------------------
-- 3. PROTEGER CAMPOS SENSÍVEIS DO PERFIL
-- A política RLS deixa o usuário editar o PRÓPRIO perfil, mas ele não
-- pode mudar o próprio cargo, o status "ativo" nem o e-mail por ali.
-- Só admin pode. Comandos sem usuário logado (SQL Editor do Supabase
-- ou a chave service_role do back-end) também passam — visitantes
-- anônimos já são barrados pela RLS antes de chegar aqui.
-- ---------------------------------------------------------------------
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.eh_admin() then
    return new;
  end if;

  if new.cargo is distinct from old.cargo
     or new.ativo is distinct from old.ativo
     or new.email is distinct from old.email then
    raise exception 'Você não tem permissão para alterar cargo, status ou e-mail.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists antes_atualizar_perfil on public.perfis;
create trigger antes_atualizar_perfil
  before update on public.perfis
  for each row execute function public.proteger_campos_perfil();


-- ---------------------------------------------------------------------
-- 4. RECALCULAR MÉDIA DE ESTRELAS (RF24)
-- Roda depois de qualquer insert/update/delete em avaliacoes.
-- ---------------------------------------------------------------------
create or replace function public.recalcular_media_livro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_livro_id bigint := coalesce(new.livro_id, old.livro_id);
begin
  update public.livros l
     set media_estrelas   = coalesce(s.media, 0),
         total_avaliacoes = coalesce(s.total, 0)
    from (
      select round(avg(nota)::numeric, 1) as media,
             count(*)::int                as total
        from public.avaliacoes
       where livro_id = v_livro_id
    ) s
   where l.id = v_livro_id;

  return null; -- gatilho "after": o retorno é ignorado
end;
$$;

drop trigger if exists apos_mudar_avaliacao on public.avaliacoes;
create trigger apos_mudar_avaliacao
  after insert or update or delete on public.avaliacoes
  for each row execute function public.recalcular_media_livro();


-- ---------------------------------------------------------------------
-- 5. updated_at AUTOMÁTICO
-- ---------------------------------------------------------------------
create or replace function public.atualizar_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists antes_atualizar_livro on public.livros;
create trigger antes_atualizar_livro
  before update on public.livros
  for each row execute function public.atualizar_updated_at();

drop trigger if exists antes_atualizar_avaliacao on public.avaliacoes;
create trigger antes_atualizar_avaliacao
  before update on public.avaliacoes
  for each row execute function public.atualizar_updated_at();

drop trigger if exists antes_atualizar_resenha on public.resenhas;
create trigger antes_atualizar_resenha
  before update on public.resenhas
  for each row execute function public.atualizar_updated_at();
