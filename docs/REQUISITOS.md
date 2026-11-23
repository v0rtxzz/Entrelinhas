# ✅ Requisitos → Onde está no código

Use esta página para achar rápido **onde mexer** em cada funcionalidade do documento.
Caminhos abreviados: `FE` = `frontend/src`, `BE` = `backend/src`, `DB` = `database/migrations`.

## Requisitos Funcionais

| RF | O que é | Status | Onde está |
|---|---|:-:|---|
| RF01 | Cadastro (perfil "Usuário" automático) | ✅ | `FE/pages/auth/Cadastrar.jsx` · gatilho `criar_perfil_novo_usuario` em `DB/02` |
| RF02 | Login e menu por perfil | ✅ | `FE/pages/auth/Entrar.jsx` · `FE/contexts/AuthContext.jsx` · `FE/components/layout/Cabecalho.jsx` |
| RF03 | Logout e recuperação de senha | ✅ | `FE/pages/auth/EsqueciSenha.jsx` · `NovaSenha.jsx` · `sair()` no AuthContext |
| RF04 | Perfil do estudante (dados, avatar, resenhas, favoritos) | ✅ | `FE/pages/Perfil.jsx` · `BE/controllers/perfilController.js` |
| RF05 | Painel da Bibliotecária | ✅ | `FE/pages/painel/PainelBiblioteca.jsx` |
| RF06 | Painel Admin (cargos, desativar contas) | ✅ | `FE/pages/painel/PainelAdmin.jsx` · `BE/controllers/adminController.js` |
| RF07 | Cadastro completo de livros (com capa) | ✅ | `FE/pages/painel/FormLivro.jsx` · `BE/controllers/livrosController.js → criar` |
| RF08 | Disponível / Emprestado / Consulta local | ✅ | select na tabela do painel e na ficha do livro · `alterarStatus` |
| RF09 | Listagem administrativa com busca | ✅ | aba "Acervo" do `PainelBiblioteca.jsx` |
| RF10 | Editar livro | ✅ | `FormLivro.jsx` (modo edição) · `atualizar` |
| RF11 | Excluir com confirmação | ✅ | `FE/components/ui/ModalConfirmar.jsx` · `excluir` |
| RF12 | Vitrine em cards | ✅ | `FE/pages/Acervo.jsx` · `FE/components/livros/CardLivro.jsx` |
| RF13 | Página de detalhes | ✅ | `FE/pages/DetalheLivro.jsx` |
| RF14 | Busca por texto | ✅ | `FE/components/livros/Filtros.jsx` · `listar` no back |
| RF15 | Ordenar A–Z, Z–A, nota, recentes | ✅ | `ORDENACOES` em `FE/utils/constantes.js` e `BE/utils/constantes.js` |
| RF16–RF20 | Filtros autor, gênero, temática, idade, ano | ✅ | `Filtros.jsx` · `listar` |
| RF21 | Combinar e limpar filtros | ✅ | filtros ficam na URL (`Acervo.jsx`) · botão "Limpar filtros" |
| RF22 | Estado vazio com o Avelã | ✅ | `FE/components/avela/EstadoVazio.jsx` |
| RF23 | Estrelas 1–5, um voto por pessoa | ✅ | `FE/components/livros/Estrelas.jsx` · `unique (livro_id, usuario_id)` em `DB/01` |
| RF24 | Média automática | ✅ | gatilho `recalcular_media_livro` em `DB/02` |
| RF25 | Publicar resenha com nome e nota | ✅ | `FE/components/resenhas/SecaoResenhas.jsx` |
| RF26 | Editar/apagar a própria resenha | ✅ | `SecaoResenhas.jsx` · RLS em `DB/03` |
| RF27 | Ordenar resenhas | ✅ | select "Ordenar por" em `SecaoResenhas.jsx` |
| RF28 | Moderação | ✅ | aba "Moderação" do painel · botão "Moderar" na ficha |
| RF29 | Lista "Quero Ler" | ✅ | botão na ficha · aba no Perfil · `favoritosController.js` |
| RF30 | Ranking de destaques | ✅ | "Os queridinhos da turma" em `Acervo.jsx` · `destaques` |

## Requisitos Não Funcionais

| RNF | O que é | Onde está |
|---|---|---|
| RNF01 | Paleta avelã | `FE/styles/tokens.css` (todas as cores num lugar só) |
| RNF02 | Mascote Avelã | `FE/components/avela/Avela.jsx` (SVG com 6 avatares e 4 expressões) |
| RNF03 | Carregamento com novelo e patinhas | `FE/components/avela/TelaCarregamento.jsx` + `FE/styles/avela.css` |
| RNF04 | Usabilidade multigeracional | fontes grandes, rótulos em todos os campos, foco visível, botões grandes |
| RNF05 | Feedback visual | `FE/contexts/ToastContext.jsx` |
| RNF06 | Supabase Auth | `FE/contexts/AuthContext.jsx` |
| RNF07 | RLS | `DB/03_seguranca_rls.sql` (testado com cada perfil) |
| RNF08 | Proteção de rotas | `FE/components/rotas/RotaProtegida.jsx` + middlewares em `BE/middlewares/autenticacao.js` |
| RNF09 | Validação (nota só inteiro 1–5) | `BE/utils/validacoes.js` + `check` no banco |
| RNF10 | Sanitização XSS | `BE/utils/sanitizar.js` (o React também escapa tudo) |
| RNF11 | Banco relacional | `DB/01_tabelas.sql` (chaves estrangeiras com `on delete cascade`) |
| RNF12 | Capas no Storage | `DB/04_storage_capas.sql` · `FE/services/capas.js` |
| RNF13 | Vercel + HTTPS | `docs/DEPLOY.md` · `vercel.json` em cada pasta |
| RNF14 | Camadas separadas | pastas `frontend/`, `backend/`, `database/` + `.env.example` em cada uma |
| RNF15 | Responsivo | `@media` em `layout.css`, `componentes.css`, `paginas.css`, `painel.css` |
| RNF17 | ≤ 3 s | índices em `DB/01` · paginação · busca com espera de 400 ms |

## 📝 Diferenças em relação ao DER do documento

- `livros.total_avaliacoes` — novo, pedido pelo RF24.
- `updated_at` em `livros`, `avaliacoes` e `resenhas` — para mostrar "(editada)".
- `classificacao_etaria` guarda `L, 10, 12, 14, 16, 18`; `status_disponibilidade` guarda `disponivel, emprestado, consulta_local`. Os textos bonitos ficam em `FE/utils/constantes.js`.
- O documento cita **MySQL** na divisão de papéis, mas os RNF pedem **Supabase (PostgreSQL)** — seguimos o Supabase.

---

## 💡 Ideias de melhoria (escolha o que quiser priorizar)

**Para a biblioteca**
- [ ] Empréstimos de verdade: tabela `emprestimos` (quem pegou, data de devolução, atrasos)
- [ ] Mais de um exemplar por livro (quantidade disponível)
- [ ] Importar livros por planilha CSV ou buscar dados pelo ISBN (Google Books / Open Library)
- [ ] Relatórios: livros mais lidos, mais favoritados, alunos mais ativos

**Para os estudantes**
- [ ] "Já li" e "Lendo agora", além do "Quero Ler"
- [ ] Recomendações: "quem gostou deste também gostou de…"
- [ ] Curtir resenhas úteis e ordenar por "mais úteis"
- [ ] Denunciar resenha (cai na fila de moderação)
- [ ] Filtro automático pela idade do aluno (guardar data de nascimento/nível de ensino)

**Técnico**
- [ ] Testes automáticos (Vitest no front, Supertest na API)
- [ ] Limite de requisições (rate limit) na API
- [ ] Filtro de palavrões nas resenhas antes de publicar
- [ ] Modo escuro (só criar outra versão de `tokens.css`)
- [ ] Busca sem acento (extensão `unaccent` do PostgreSQL)
