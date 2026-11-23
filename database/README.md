# 🗄️ Banco de dados (Supabase / PostgreSQL)

## Jeito rápido
Cole **`setup_completo.sql`** no **SQL Editor** do Supabase → **Run**. Pronto.
(Pode rodar de novo sem quebrar nada.)

## Arquivos
| Arquivo | O que faz |
|---|---|
| `migrations/01_tabelas.sql` | Cria `perfis`, `livros`, `avaliacoes`, `resenhas`, `favoritos` e índices |
| `migrations/02_funcoes_e_gatilhos.sql` | Funções de permissão, perfil automático no cadastro, média de estrelas, bloqueio de auto-promoção a admin |
| `migrations/03_seguranca_rls.sql` | Políticas RLS (a matriz de permissões do documento) |
| `migrations/04_storage_capas.sql` | Bucket público `capas` (só equipe envia; até 2 MB) |
| `setup_completo.sql` | Os 4 acima juntos, na ordem |
| `seeds/livros_exemplo.sql` | 12 livros de exemplo (opcional) |
| `scripts/definir_primeiro_admin.sql` | Promove sua conta a admin (rodar uma vez) |

> Se mudar algo em `migrations/`, gere o `setup_completo.sql` de novo (ou rode só o arquivo alterado).

## Diagrama (resumo)

```
auth.users ──1:1── perfis ──1:N── avaliacoes ──N:1── livros
                     │                                 │
                     ├──1:N── resenhas ────────N:1─────┤
                     └──1:N── favoritos ───────N:1─────┘
```

## O que acontece sozinho (gatilhos)
- **Alguém se cadastra** → cria a linha em `perfis` com cargo `usuario`.
- **Alguém avalia/muda/apaga nota** → recalcula `livros.media_estrelas` e `total_avaliacoes`.
- **Alguém tenta mudar o próprio cargo** → erro (só admin pode).
- **Livro excluído** → apaga junto as avaliações, resenhas e favoritos dele.

## Testado
As políticas foram testadas simulando estudante, bibliotecária, admin, conta desativada e visitante: cada um só consegue o que a matriz permite.
