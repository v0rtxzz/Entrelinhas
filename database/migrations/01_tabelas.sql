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
