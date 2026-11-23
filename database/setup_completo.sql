-- =====================================================================
-- ENTRELINHAS · SETUP COMPLETO (gerado juntando migrations/01..04)
-- Cole TUDO no SQL Editor do Supabase e clique em Run.
-- Pode rodar de novo sem problema (é idempotente).
-- Os arquivos separados em migrations/ são a versão "para ler".
-- =====================================================================


-- >>>>>>>>>>>>>>>>>>>> migrations/01_tabelas.sql <<<<<<<<<<<<<<<<<<<<
-- =====================================================================
-- ENTRELINHAS · 01 · TABELAS
-- ---------------------------------------------------------------------
-- Cria as 5 tabelas do DER: perfis, livros, avaliacoes, resenhas e
-- favoritos. Rode este arquivo PRIMEIRO no SQL Editor do Supabase.
--
-- Diferenças em relação ao DER do PDF (todas pequenas e documentadas):
--   * livros.total_avaliacoes  -> pedido pelo RF24 ("total de avaliações")
--   * updated_at em livros, avaliacoes e resenhas -> saber quando algo
--     foi editado (útil para mostrar "editada" nas resenhas)
--   * favoritos.id e livros.id usam bigint identity (auto incremento)
-- =====================================================================


-- ---------------------------------------------------------------------
-- PERFIS
-- Um perfil para cada usuário do Supabase Auth (auth.users).
-- O perfil é criado automaticamente por um gatilho (ver arquivo 02).
-- ---------------------------------------------------------------------
create table if not exists public.perfis (
  id             uuid primary key references auth.users (id) on delete cascade,
  nome           varchar(120) not null,
  email          varchar(255) not null unique,
  turma_unidade  varchar(120),
  cargo          varchar(20)  not null default 'usuario'
                 check (cargo in ('usuario', 'bibliotecaria', 'admin')),
  avatar_avela   varchar(40)  not null default 'classico',
  ativo          boolean      not null default true,
  created_at     timestamptz  not null default now()
);

comment on table  public.perfis       is 'Dados públicos e de permissão de cada usuário.';
comment on column public.perfis.cargo is 'usuario (estudante) | bibliotecaria | admin';
comment on column public.perfis.avatar_avela is 'Código do avatar do mascote Avelã escolhido pelo usuário.';


-- ---------------------------------------------------------------------
-- LIVROS
-- Acervo da biblioteca. Só a equipe (bibliotecária/admin) altera.
-- ---------------------------------------------------------------------
create table if not exists public.livros (
  id                      bigint generated always as identity primary key,
  codigo_acervo           varchar(30)  not null unique,
  titulo                  varchar(200) not null,
  autor                   varchar(150) not null,
  descricao               text,
  sinopse                 text,
  ano_publicacao          integer
                          check (ano_publicacao between 1000 and 2100),
  genero                  varchar(60)  not null,
  tematica                varchar(60),
  classificacao_etaria    varchar(4)   not null default 'L'
                          check (classificacao_etaria in ('L', '10', '12', '14', '16', '18')),
  status_disponibilidade  varchar(20)  not null default 'disponivel'
                          check (status_disponibilidade in ('disponivel', 'emprestado', 'consulta_local')),
  capa_url                text,
  media_estrelas          numeric(2,1) not null default 0,
  total_avaliacoes        integer      not null default 0,
  created_at              timestamptz  not null default now(),
  updated_at              timestamptz  not null default now()
);

comment on column public.livros.classificacao_etaria   is 'L = Livre, 10, 12, 14, 16, 18 (anos)';
comment on column public.livros.status_disponibilidade is 'disponivel | emprestado | consulta_local';
comment on column public.livros.media_estrelas         is 'Calculada automaticamente pelo gatilho de avaliações.';

-- Índices para deixar filtros e ordenações rápidos (RNF17)
create index if not exists idx_livros_titulo   on public.livros (lower(titulo));
create index if not exists idx_livros_autor    on public.livros (autor);
create index if not exists idx_livros_genero   on public.livros (genero);
create index if not exists idx_livros_tematica on public.livros (tematica);
create index if not exists idx_livros_ano      on public.livros (ano_publicacao);
create index if not exists idx_livros_media    on public.livros (media_estrelas desc, total_avaliacoes desc);


-- ---------------------------------------------------------------------
-- AVALIACOES (estrelas de 1 a 5)
-- Um voto por usuário em cada livro (RF23) -> unique (livro_id, usuario_id)
-- ---------------------------------------------------------------------
create table if not exists public.avaliacoes (
  id          uuid primary key default gen_random_uuid(),
  livro_id    bigint not null references public.livros (id) on delete cascade,
  usuario_id  uuid   not null references public.perfis (id) on delete cascade,
  nota        smallint not null check (nota between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (livro_id, usuario_id)
);

create index if not exists idx_avaliacoes_livro on public.avaliacoes (livro_id);


-- ---------------------------------------------------------------------
-- RESENHAS
-- Texto escrito pelo usuário. A nota exibida ao lado vem de "avaliacoes".
-- ---------------------------------------------------------------------
create table if not exists public.resenhas (
  id          uuid primary key default gen_random_uuid(),
  livro_id    bigint not null references public.livros (id) on delete cascade,
  usuario_id  uuid   not null references public.perfis (id) on delete cascade,
  texto       text   not null check (char_length(texto) between 3 and 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_resenhas_livro   on public.resenhas (livro_id, created_at desc);
create index if not exists idx_resenhas_usuario on public.resenhas (usuario_id);


-- ---------------------------------------------------------------------
-- FAVORITOS (lista "Quero Ler")
-- ---------------------------------------------------------------------
create table if not exists public.favoritos (
  id          bigint generated always as identity primary key,
  livro_id    bigint not null references public.livros (id) on delete cascade,
  usuario_id  uuid   not null references public.perfis (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (livro_id, usuario_id)
);

create index if not exists idx_favoritos_usuario on public.favoritos (usuario_id);


-- >>>>>>>>>>>>>>>>>>>> migrations/02_funcoes_e_gatilhos.sql <<<<<<<<<<<<<<<<<<<<
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


-- >>>>>>>>>>>>>>>>>>>> migrations/03_seguranca_rls.sql <<<<<<<<<<<<<<<<<<<<
-- =====================================================================
-- ENTRELINHAS · 03 · SEGURANÇA (Row Level Security) — RNF07
-- ---------------------------------------------------------------------
-- Rode DEPOIS do 02_funcoes_e_gatilhos.sql.
--
-- RLS = o próprio banco decide quem pode ler/escrever cada linha.
-- Mesmo que alguém pule o front-end e o back-end, o banco bloqueia.
-- As regras seguem a "Matriz de Perfis e Permissões" do documento.
--
-- Legenda das funções (definidas no arquivo 02):
--   auth.uid()        -> id do usuário logado
--   usuario_ativo()   -> conta ativa?
--   eh_equipe()       -> bibliotecária ou admin
--   eh_admin()        -> admin
-- =====================================================================

alter table public.perfis     enable row level security;
alter table public.livros     enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.resenhas   enable row level security;
alter table public.favoritos  enable row level security;


-- ---------------------------------------------------------------------
-- PERFIS
-- Cada um vê/edita o próprio. Equipe vê todos. Só admin altera outros.
-- (Nomes dos autores das resenhas são lidos pelo back-end, que devolve
--  só nome e avatar — nunca e-mail.)
-- ---------------------------------------------------------------------
drop policy if exists "perfis: ver o proprio ou equipe ve todos" on public.perfis;
create policy "perfis: ver o proprio ou equipe ve todos"
  on public.perfis for select
  to authenticated
  using (id = auth.uid() or public.eh_equipe());

drop policy if exists "perfis: editar o proprio" on public.perfis;
create policy "perfis: editar o proprio"
  on public.perfis for update
  to authenticated
  using (id = auth.uid() and public.usuario_ativo())
  with check (id = auth.uid());

drop policy if exists "perfis: admin edita qualquer um" on public.perfis;
create policy "perfis: admin edita qualquer um"
  on public.perfis for update
  to authenticated
  using (public.eh_admin())
  with check (public.eh_admin());


-- ---------------------------------------------------------------------
-- LIVROS
-- Qualquer pessoa (até visitante) pode ver o acervo.
-- Só a equipe cadastra, edita e exclui (RF07–RF11).
-- ---------------------------------------------------------------------
drop policy if exists "livros: todos podem ver" on public.livros;
create policy "livros: todos podem ver"
  on public.livros for select
  to anon, authenticated
  using (true);

drop policy if exists "livros: equipe cadastra" on public.livros;
create policy "livros: equipe cadastra"
  on public.livros for insert
  to authenticated
  with check (public.eh_equipe());

drop policy if exists "livros: equipe edita" on public.livros;
create policy "livros: equipe edita"
  on public.livros for update
  to authenticated
  using (public.eh_equipe())
  with check (public.eh_equipe());

drop policy if exists "livros: equipe exclui" on public.livros;
create policy "livros: equipe exclui"
  on public.livros for delete
  to authenticated
  using (public.eh_equipe());


-- ---------------------------------------------------------------------
-- AVALIACOES
-- Todos veem. Usuário ativo cria/edita/apaga só a própria nota.
-- ---------------------------------------------------------------------
drop policy if exists "avaliacoes: todos podem ver" on public.avaliacoes;
create policy "avaliacoes: todos podem ver"
  on public.avaliacoes for select
  to anon, authenticated
  using (true);

drop policy if exists "avaliacoes: criar a propria" on public.avaliacoes;
create policy "avaliacoes: criar a propria"
  on public.avaliacoes for insert
  to authenticated
  with check (usuario_id = auth.uid() and public.usuario_ativo());

drop policy if exists "avaliacoes: editar a propria" on public.avaliacoes;
create policy "avaliacoes: editar a propria"
  on public.avaliacoes for update
  to authenticated
  using (usuario_id = auth.uid() and public.usuario_ativo())
  with check (usuario_id = auth.uid());

drop policy if exists "avaliacoes: apagar a propria" on public.avaliacoes;
create policy "avaliacoes: apagar a propria"
  on public.avaliacoes for delete
  to authenticated
  using (usuario_id = auth.uid());


-- ---------------------------------------------------------------------
-- RESENHAS
-- Todos veem. Usuário ativo escreve/edita a própria (RF25, RF26).
-- Equipe pode excluir qualquer uma — moderação (RF28).
-- ---------------------------------------------------------------------
drop policy if exists "resenhas: todos podem ver" on public.resenhas;
create policy "resenhas: todos podem ver"
  on public.resenhas for select
  to anon, authenticated
  using (true);

drop policy if exists "resenhas: criar a propria" on public.resenhas;
create policy "resenhas: criar a propria"
  on public.resenhas for insert
  to authenticated
  with check (usuario_id = auth.uid() and public.usuario_ativo());

drop policy if exists "resenhas: editar a propria" on public.resenhas;
create policy "resenhas: editar a propria"
  on public.resenhas for update
  to authenticated
  using (usuario_id = auth.uid() and public.usuario_ativo())
  with check (usuario_id = auth.uid());

drop policy if exists "resenhas: apagar a propria ou moderar" on public.resenhas;
create policy "resenhas: apagar a propria ou moderar"
  on public.resenhas for delete
  to authenticated
  using (usuario_id = auth.uid() or public.eh_equipe());


-- ---------------------------------------------------------------------
-- FAVORITOS ("Quero Ler") — totalmente privados (RF29)
-- ---------------------------------------------------------------------
drop policy if exists "favoritos: ver os proprios" on public.favoritos;
create policy "favoritos: ver os proprios"
  on public.favoritos for select
  to authenticated
  using (usuario_id = auth.uid());

drop policy if exists "favoritos: adicionar os proprios" on public.favoritos;
create policy "favoritos: adicionar os proprios"
  on public.favoritos for insert
  to authenticated
  with check (usuario_id = auth.uid() and public.usuario_ativo());

drop policy if exists "favoritos: remover os proprios" on public.favoritos;
create policy "favoritos: remover os proprios"
  on public.favoritos for delete
  to authenticated
  using (usuario_id = auth.uid());


-- >>>>>>>>>>>>>>>>>>>> migrations/04_storage_capas.sql <<<<<<<<<<<<<<<<<<<<
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
