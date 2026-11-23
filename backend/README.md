# ⚙️ Back-end — API REST (Node.js + Express)

```bash
cp .env.example .env   # preencha com os dados do Supabase
npm install
npm run dev            # http://localhost:3001/api/saude
```

## Como uma requisição percorre o código

```
src/routes/index.js         qual URL chama qual função (e quem pode)
      ↓
src/middlewares/            autenticacao.js → confere login e cargo
      ↓
src/controllers/            a regra de negócio (ex.: livrosController.js)
      ↓   usa
src/utils/                  validacoes.js · sanitizar.js · constantes.js
      ↓
Supabase (com o token do usuário → a RLS do banco vale aqui também)
      ↓
src/middlewares/tratarErros.js   transforma qualquer erro em { erro, detalhes }
```

## Onde mexer
| Quero… | Arquivo |
|---|---|
| Criar uma rota nova | `src/routes/index.js` + um controller |
| Mudar uma regra de validação | `src/utils/validacoes.js` |
| Adicionar um gênero/status/avatar permitido | `src/utils/constantes.js` (e o `check` no banco, se houver) |
| Liberar outro domínio no CORS | variável `FRONTEND_URL` |

Todas as rotas estão documentadas em [`../docs/API.md`](../docs/API.md).

## Por que só a chave "anon"?
A API repassa o token do usuário logado ao Supabase. Assim o banco sabe quem é e aplica a RLS — a API nunca tem "superpoderes" e não existe uma chave secreta para vazar.
