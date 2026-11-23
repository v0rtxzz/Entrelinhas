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
