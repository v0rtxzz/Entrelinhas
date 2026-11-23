# 🎨 Front-end (React + Vite)

```bash
cp .env.example .env   # preencha com os dados do Supabase
npm install
npm run dev            # http://localhost:5173  (o back-end precisa estar rodando)
```

## Onde mexer
| Quero… | Arquivo |
|---|---|
| Ver todas as telas/rotas | `src/App.jsx` |
| Mudar cores da paleta | `src/styles/tokens.css` |
| Mudar o desenho do Avelã ou criar avatar novo | `src/components/avela/Avela.jsx` (+ `AVATARES` em `src/utils/constantes.js` e no back) |
| Mudar a tela de carregamento | `src/components/avela/TelaCarregamento.jsx` + `src/styles/avela.css` |
| Mudar os cards da vitrine | `src/components/livros/CardLivro.jsx` |
| Mudar os filtros | `src/components/livros/Filtros.jsx` |
| Mudar textos de gêneros/temáticas sugeridos | `src/utils/constantes.js` |
| Chamar uma rota nova da API | `src/services/api.js` |
| Mudar mensagens de login/erro | `src/contexts/AuthContext.jsx` |

## Pastas
```
src/
├── App.jsx            mapa das telas
├── main.jsx           liga tudo (rotas + avisos + login)
├── pages/             telas (Acervo, DetalheLivro, Perfil, auth/, painel/)
├── components/
│   ├── avela/         mascote, logo, carregamento, estado vazio
│   ├── livros/        capa, card, estrelas, selos, filtros
│   ├── resenhas/      mural de resenhas
│   ├── layout/        cabeçalho, rodapé
│   ├── rotas/         proteção de rotas por cargo
│   └── ui/            campo de formulário, modal, paginação
├── contexts/          AuthContext (login) e ToastContext (avisos)
├── services/          api.js (back-end) e capas.js (Storage)
├── hooks/             useDebounce
├── utils/             constantes e formatação
└── styles/            CSS separado por assunto
```

Todos os comentários e nomes estão em português para facilitar a leitura.
