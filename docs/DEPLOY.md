# 🚀 Passo a passo: GitHub → Supabase → Vercel

> ✅ **Situação atual (já publicado)**
>
> | Peça | Onde | Detalhes |
> |---|---|---|
> | Front-end | Vercel (conta SENAI) → projeto `entrelinhas-site` | <https://entrelinhas-site-six.vercel.app> · Root Directory `frontend` |
> | Back-end | Vercel (conta SENAI) → projeto `entrelinhas` | <https://entrelinhas-lovat.vercel.app> · Root Directory `backend` |
> | Banco | Supabase (conta SENAI) → projeto `Entrelinhas` | Região `us-west-2` · Site URL e Redirect URLs apontando para o front |
>
> Variáveis já cadastradas na Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `FRONTEND_URL` (API) e `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (site).
>
> **Como o site é atualizado:** o repositório oficial é `v0rtxzz/Entrelinhas`. A cada push no `main`, o GitHub Actions
> ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) publica a API e o site na Vercel do SENAI.
> Só precisa existir o secret `VERCEL_TOKEN` (token criado em vercel.com/account/tokens na conta do SENAI) em
> **Settings → Secrets and variables → Actions**. Dá para rodar na mão em **Actions → Deploy na Vercel → Run workflow**.
>
> O passo a passo abaixo serve para montar tudo do zero em outra conta.

Siga na ordem. Leva uns 20–30 minutos na primeira vez.

---

## 1. Subir o código no GitHub

1. Crie um repositório vazio em <https://github.com/new> (ex.: `entrelinhas`). **Não** marque "Add README".
2. No terminal, dentro da pasta `entrelinhas`:

```bash
git init
git add .
git commit -m "Primeira versão do Entrelinhas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/entrelinhas.git
git push -u origin main
```

> 🔒 Os arquivos `.env` (com as chaves) **não** sobem — o `.gitignore` já cuida disso. Só os `.env.example` vão.

---

## 2. Criar o projeto no Supabase

1. Entre em <https://supabase.com> → **New project**.
2. Dê um nome (`entrelinhas`), crie uma senha forte para o banco e escolha a região **South America (São Paulo)**.
3. Espere o projeto ficar pronto (1–2 min).

## 3. Criar o banco de dados

1. No menu lateral, abra **SQL Editor** → **New query**.
2. Abra o arquivo [`database/setup_completo.sql`](../database/setup_completo.sql), copie **tudo**, cole e clique em **Run**.
   - Aparecerem avisos "NOTICE … does not exist, skipping" é normal.
3. (Opcional) Nova query → cole [`database/seeds/livros_exemplo.sql`](../database/seeds/livros_exemplo.sql) → **Run** (12 livros de teste).
4. Confira em **Table Editor**: devem existir `perfis`, `livros`, `avaliacoes`, `resenhas`, `favoritos`. Em **Storage** deve aparecer o bucket `capas`.

## 4. Pegar as chaves

**Project Settings → API** (ou **Data API / API Keys**). Anote:

| O quê | Vai em |
|---|---|
| **Project URL** | `SUPABASE_URL` (back) e `VITE_SUPABASE_URL` (front) |
| **anon / publishable key** | `SUPABASE_ANON_KEY` (back) e `VITE_SUPABASE_ANON_KEY` (front) |

> ⚠️ **Nunca** use a chave `service_role` / `secret` no projeto. Este sistema não precisa dela.

## 5. Configurar o login (Auth)

Em **Authentication → URL Configuration**:

- **Site URL:** a URL do seu front no Vercel (ex.: `https://entrelinhas.vercel.app`). Enquanto testa local, use `http://localhost:5173`.
- **Redirect URLs:** adicione as duas:
  - `http://localhost:5173/**`
  - `https://entrelinhas.vercel.app/**` (sua URL real)

Em **Authentication → Providers → Email**:
- "Confirm email" ligado = o aluno precisa clicar no link do e-mail antes de entrar (mais seguro).
- Desligado = entra na hora (mais prático para testar e apresentar).

> O e-mail grátis do Supabase tem limite baixo (poucos por hora). Para a escola usar de verdade, configure um SMTP em **Authentication → Emails → SMTP Settings**.

---

## 6. Publicar o BACK-END no Vercel

1. <https://vercel.com/new> → **Import** o repositório do GitHub.
2. Em **Root Directory**, clique em *Edit* e escolha **`backend`**.
3. Framework Preset: **Other**.
4. Em **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `SUPABASE_URL` | a Project URL |
| `SUPABASE_ANON_KEY` | a anon/publishable key |
| `FRONTEND_URL` | por enquanto `http://localhost:5173` (vamos trocar no passo 8) |

5. **Deploy**. Ao terminar, abra `https://SEU-BACKEND.vercel.app/api/saude` — deve aparecer `{"status":"ok",...}`.

## 7. Publicar o FRONT-END no Vercel

1. <https://vercel.com/new> → importe **o mesmo repositório de novo**.
2. **Root Directory:** **`frontend`**. Framework: **Vite** (detecta sozinho).
3. **Environment Variables:**

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | a Project URL |
| `VITE_SUPABASE_ANON_KEY` | a anon/publishable key |
| `VITE_API_URL` | a URL do back-end do passo 6 (sem `/api` no fim) |

4. **Deploy**.

## 8. Ligar um no outro

1. Copie a URL do front (ex.: `https://entrelinhas.vercel.app`).
2. No projeto do **back-end** no Vercel → **Settings → Environment Variables** → edite `FRONTEND_URL` para essa URL.
   - Para aceitar local e produção: `http://localhost:5173,https://entrelinhas.vercel.app`
3. **Deployments → ⋯ → Redeploy** no back-end.
4. No Supabase, confira se a URL do front está no **Site URL / Redirect URLs** (passo 5).

## 9. Criar o primeiro admin

1. Abra o site, clique em **Criar conta** e cadastre-se.
2. No Supabase → SQL Editor → cole [`database/scripts/definir_primeiro_admin.sql`](../database/scripts/definir_primeiro_admin.sql), troque o e-mail e rode.
3. Saia e entre de novo no site: vai aparecer **Painel da Biblioteca** e **Painel Admin** no menu.
4. Pelo Painel Admin você já consegue transformar a conta da Erica em **Bibliotecária**.

---

## 🧯 Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Não foi possível falar com o servidor" | `VITE_API_URL` errado ou CORS | Confira a URL e o `FRONTEND_URL` do back; faça Redeploy |
| Console do navegador diz "blocked by CORS policy" | `FRONTEND_URL` não bate exatamente | Sem barra no final, com `https://` |
| Login funciona mas "Perfil não encontrado" | Usuário criado antes de rodar o SQL | Apague o usuário em Authentication → Users e cadastre de novo |
| Página dá 404 ao recarregar no Vercel | Falta o `vercel.json` do front | Ele já vem no projeto; confira que o Root Directory é `frontend` |
| E-mail de recuperação não chega | Limite do e-mail grátis do Supabase | Espere ou configure SMTP |
| "Você não tem permissão" ao cadastrar livro | Sua conta ainda é estudante | Rode o script do passo 9 |
| Erro ao enviar capa | Imagem > 2 MB ou formato diferente de JPG/PNG/WEBP | Reduza a imagem ou cole um link |
