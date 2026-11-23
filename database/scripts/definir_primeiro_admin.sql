-- =====================================================================
-- ENTRELINHAS · DEFINIR O PRIMEIRO ADMIN E A BIBLIOTECÁRIA
-- ---------------------------------------------------------------------
-- Todo cadastro nasce como 'usuario'. O primeiro admin precisa ser
-- promovido "na mão", uma única vez, aqui no SQL Editor.
-- Depois disso, o próprio admin promove outras pessoas pelo Painel Admin.
--
-- PASSO A PASSO:
--   1. Crie a conta normalmente pelo site (tela "Criar conta").
--   2. Troque o e-mail abaixo pelo e-mail usado no cadastro.
--   3. Rode este script.
-- =====================================================================

update public.perfis
   set cargo = 'admin'
 where email = 'SEU-EMAIL-AQUI@exemplo.com';

-- (Opcional) Já deixar a bibliotecária Erica com o cargo certo:
-- update public.perfis
--    set cargo = 'bibliotecaria'
--  where email = 'email-da-erica@exemplo.com';

-- Conferir:
select nome, email, cargo, ativo from public.perfis order by created_at;
