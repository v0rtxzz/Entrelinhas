# 🔌 API do Entrelinhas

Base: `https://SEU-BACKEND.vercel.app/api` (local: `http://localhost:3001/api`)

**Autenticação:** rotas 🔑/📚/🛡️ precisam do cabeçalho
`Authorization: Bearer <access_token do Supabase>` — o front-end coloca sozinho (`frontend/src/services/api.js`).

**Erros** sempre vêm assim:
```json
{ "erro": "Alguns campos precisam de atenção.", "detalhes": { "titulo": "Título é obrigatório." } }
```
| Status | Quando |
|---|---|
| 400 | Dados inválidos (veja `detalhes`) |
| 401 | Sem login ou sessão expirada |
| 403 | Sem permissão / conta desativada |
| 404 | Não encontrado |
| 409 | Duplicado (ex.: código do acervo repetido) |

Legenda: 🌐 público · 🔑 logado · 📚 bibliotecária ou admin · 🛡️ só admin

---

## Livros

### 🌐 `GET /livros` — vitrine com filtros (RF12, RF14–RF21)
| Parâmetro | Exemplo | Descrição |
|---|---|---|
| `busca` | `dom` | procura em título, autor e descrição |
| `autor` | `Machado de Assis` | autor exato |
| `genero` | `Romance` | |
| `tematica` | `História` | |
| `classificacao` | `L,10,12` | uma ou várias faixas |
| `ano` | `1899` | |
| `status` | `disponivel` | `disponivel` · `emprestado` · `consulta_local` |
| `ordem` | `nota` | `az` (padrão) · `za` · `nota` · `recentes` |
| `pagina`, `porPagina` | `1`, `12` | máx. 48 por página |

Resposta: `{ livros: [...], total, pagina, porPagina, totalPaginas }`

### 🌐 `GET /livros/opcoes-filtro`
`{ autores: [], generos: [], tematicas: [], anos: [] }` — só valores que existem no acervo.

### 🌐 `GET /livros/destaques?limite=6` — ranking (RF30)

### 🌐 `GET /livros/:id` — ficha completa (RF13)
`{ livro, minhaNota, favorito }` (os dois últimos só preenchidos se logado)

### 📚 `POST /livros` — cadastrar (RF07)
```json
{
  "codigo_acervo": "ENT-0013", "titulo": "…", "autor": "…", "genero": "Romance",
  "tematica": "Cotidiano", "classificacao_etaria": "12", "status_disponibilidade": "disponivel",
  "ano_publicacao": 2001, "descricao": "…", "sinopse": "…", "capa_url": "https://…"
}
```
Obrigatórios: `codigo_acervo`, `titulo`, `autor`, `genero`, `classificacao_etaria`.

### 📚 `PUT /livros/:id` — editar (RF10) · envia só os campos que mudam
### 📚 `PATCH /livros/:id/status` — `{ "status_disponibilidade": "emprestado" }` (RF08)
### 📚 `DELETE /livros/:id` — excluir (RF11)

---

## Avaliações (estrelas)

### 🔑 `PUT /livros/:id/avaliacao` — `{ "nota": 4 }` (RF23)
Cria ou troca a nota do usuário. Resposta já traz a média nova: `{ minhaNota, media_estrelas, total_avaliacoes }` (RF24).

### 🔑 `DELETE /livros/:id/avaliacao` — remove a própria nota

---

## Resenhas

### 🌐 `GET /livros/:id/resenhas?ordem=recentes|notas` (RF27)
Cada item: `{ id, texto, created_at, updated_at, usuario_id, nota, autor: { nome, avatar_avela, cargo } }`

### 🔑 `POST /livros/:id/resenhas` — `{ "texto": "…", "nota": 5 }` (RF25)
`nota` é opcional; se vier, também salva a avaliação.

### 🔑 `PUT /resenhas/:id` — `{ "texto": "…" }` · só a própria (RF26)
### 🔑/📚 `DELETE /resenhas/:id` — a própria, ou qualquer uma se for equipe (RF26, RF28)
### 📚 `GET /resenhas?pagina=1` — lista geral para moderação (RF28)

---

## Favoritos ("Quero Ler") — RF29
| | |
|---|---|
| 🔑 `GET /favoritos` | `{ livros: [...] }` |
| 🔑 `POST /favoritos/:livroId` | adiciona (clicar 2× não dá erro) |
| 🔑 `DELETE /favoritos/:livroId` | remove |

## Perfil — RF04
| | |
|---|---|
| 🔑 `GET /perfil` | `{ perfil, resenhas }` |
| 🔑 `PATCH /perfil` | `{ nome?, turma_unidade?, avatar_avela? }` |

Avatares: `classico`, `leitor`, `cachecol`, `laco`, `noturno`, `formatura`.

## Admin — RF06
| | |
|---|---|
| 🛡️ `GET /admin/usuarios?busca=ana` | lista contas |
| 🛡️ `PATCH /admin/usuarios/:id` | `{ cargo?: "usuario"\|"bibliotecaria"\|"admin", ativo?: true\|false }` |

O admin não pode alterar o próprio cargo nem se desativar (evita ficar trancado para fora).

## Saúde
🌐 `GET /saude` → `{ "status": "ok" }` — use para testar se a API está no ar.
