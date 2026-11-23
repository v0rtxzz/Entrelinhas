# 📚 Entrelinhas — Sistema de Biblioteca SESI/SENAI

> Biblioteca digital acolhedora e intuitiva, guiada pelo gatinho **Avelã** 😺, que conecta a gestão do acervo pela bibliotecária à descoberta colaborativa de livros pelos estudantes — com filtros inteligentes, classificação etária, notas de 1 a 5 estrelas e resenhas da comunidade escolar.

| Camada | Tecnologia | Onde fica | Onde roda |
|---|---|---|---|
| **Front-end** | React 18 + Vite + React Router | [`frontend/`](frontend/) | Vercel |
| **Back-end** | Node.js 20 + Express 5 (API REST) | [`backend/`](backend/) | Vercel (serverless) |
| **Banco de dados** | PostgreSQL + Auth + Storage | [`database/`](database/) | Supabase |

## 🌐 No ar

| O quê | Endereço |
|---|---|
| **Site** | <https://entrelinhas-site-six.vercel.app> |
| **API** | <https://entrelinhas-lovat.vercel.app> (teste: [`/api/saude`](https://entrelinhas-lovat.vercel.app/api/saude)) |

Hospedagem na conta Vercel do SENAI (projetos `entrelinhas-site` = front e `entrelinhas` = API) e banco no projeto **Entrelinhas** do Supabase do SENAI.
Variáveis de ambiente e URLs de login já configuradas — veja [docs/DEPLOY.md](docs/DEPLOY.md).

---

## 🗺️ Como o sistema funciona

```
 Navegador (React)                 API (Express)                 Supabase
┌──────────────────┐  /api/...  ┌──────────────────┐  SQL     ┌──────────────────────┐
│ telas, filtros,  │ ─────────► │ valida, limpa    │ ───────► │ PostgreSQL + RLS     │
│ Avelã, toasts    │ ◄───────── │ dados, aplica    │ ◄─────── │ gatilhos (média ⭐)  │
└──────────────────┘   JSON     │ regras de cargo  │          ├──────────────────────┤
        │                       └──────────────────┘          │ Auth (login/senha)   │
        └──────── login, cadastro, senha, capas ────────────► │ Storage (capas)      │
```

- **Login** é feito direto no Supabase Auth (senha criptografada, sessão segura).
- **Dados** (livros, resenhas, favoritos…) passam pela **API**, que valida tudo e repassa o token do usuário ao banco.
- **Segurança em 3 camadas:** o front esconde o que o usuário não pode ver → a API confere o cargo → o banco (RLS) bloqueia de verdade.

---

## 📁 Estrutura de pastas

```
entrelinhas/
├── README.md                ← você está aqui
├── docs/
│   ├── DEPLOY.md            ← passo a passo: GitHub → Supabase → Vercel
│   ├── API.md               ← todas as rotas da API com exemplos
│   └── REQUISITOS.md        ← cada RF/RNF do documento → arquivo que implementa + ideias de melhoria
│
├── database/                ← tudo do Supabase
│   ├── setup_completo.sql   ← ⭐ cole este no SQL Editor (junta os 4 abaixo)
│   ├── migrations/
│   │   ├── 01_tabelas.sql             perfis, livros, avaliacoes, resenhas, favoritos
│   │   ├── 02_funcoes_e_gatilhos.sql  perfil automático, média de estrelas, proteções
│   │   ├── 03_seguranca_rls.sql       quem pode ler/escrever o quê (matriz de permissões)
│   │   └── 04_storage_capas.sql       bucket "capas" para as imagens
│   ├── seeds/livros_exemplo.sql       12 livros para testar
│   └── scripts/definir_primeiro_admin.sql
│
├── backend/                 ← API REST
│   ├── api/index.js         entrada no Vercel
│   └── src/
│       ├── app.js           monta o Express (segurança, CORS, rotas)
│       ├── server.js        entrada local (npm run dev)
│       ├── config/          variáveis de ambiente e cliente Supabase
│       ├── middlewares/     login, cargos e tratamento de erros
│       ├── routes/index.js  ⭐ mapa de todas as rotas
│       ├── controllers/     a lógica de cada recurso (livros, resenhas…)
│       └── utils/           validações, sanitização (XSS), constantes
│
└── frontend/                ← site
    └── src/
        ├── App.jsx          ⭐ mapa de todas as telas
        ├── pages/           uma pasta/arquivo por tela
        ├── components/      peças reutilizáveis (Avelã, cards, estrelas, filtros…)
        ├── contexts/        login (AuthContext) e avisos (ToastContext)
        ├── services/        conversa com a API e com o Storage
        ├── utils/           listas de opções e formatação
        └── styles/          CSS separado por assunto (tokens.css = paleta)
```

---

## 🚀 Rodando no seu computador (resumo)

Pré-requisitos: **Node.js 20+** e um projeto criado no **Supabase** (veja [docs/DEPLOY.md](docs/DEPLOY.md), passos 2 e 3).

```bash
# 1) Banco: cole database/setup_completo.sql no SQL Editor do Supabase e rode

# 2) Back-end
cd backend
cp .env.example .env        # preencha SUPABASE_URL e SUPABASE_ANON_KEY
npm install
npm run dev                 # http://localhost:3001/api/saude

# 3) Front-end (em outro terminal)
cd frontend
cp .env.example .env        # preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm install
npm run dev                 # http://localhost:5173
```

Depois: crie sua conta no site e rode `database/scripts/definir_primeiro_admin.sql` com o seu e-mail para virar **admin**.

---

## 👥 Perfis de acesso

| Ação | Estudante | Bibliotecária | Admin |
|---|:-:|:-:|:-:|
| Pesquisar, filtrar, ver detalhes e resenhas | ✅ | ✅ | ✅ |
| Avaliar (1–5 ⭐), escrever e editar as próprias resenhas | ✅ | ✅ | ✅ |
| Lista "Quero Ler" e perfil com avatar do Avelã | ✅ | ✅ | ✅ |
| Cadastrar, editar, excluir livros e mudar disponibilidade | ❌ | ✅ | ✅ |
| Moderar (excluir) resenhas de outras pessoas | ❌ | ✅ | ✅ |
| Gerenciar contas e cargos | ❌ | ❌ | ✅ |

---

## 👩‍💻 Equipe

| Integrante | Papel |
|---|---|
| Clarice da Silva Manso | Planejamento, Requisitos e Qualidade |
| Mariana Prins | Identidade Visual e Frontend |
| Ana Caroline dos Santos de Lima | Prototipação e Frontend |
| Mirella Buselli Rocco | Desenvolvimento Backend |
| Eduardo Peres | Banco de Dados e Backend |

> 💡 **Quer mudar algo?** Veja [docs/REQUISITOS.md](docs/REQUISITOS.md): lá diz em qual arquivo está cada funcionalidade e tem uma lista de melhorias sugeridas.
