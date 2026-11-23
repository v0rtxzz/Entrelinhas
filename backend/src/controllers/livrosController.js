// =====================================================================
// LIVROS — vitrine, filtros, detalhes e gestão do acervo
// RF07–RF22, RF30
// =====================================================================
import { supabasePublico } from '../config/supabase.js';
import { naoEncontrado, verificar } from '../utils/ErroApi.js';
import { inteiroOuNulo, limparBusca, limparTexto } from '../utils/sanitizar.js';
import { validarLivro, validarStatus } from '../utils/validacoes.js';
import {
  CLASSIFICACOES,
  ORDENACOES,
  POR_PAGINA_MAXIMO,
  POR_PAGINA_PADRAO,
  STATUS_DISPONIBILIDADE,
} from '../utils/constantes.js';

// Colunas que aparecem nos cards da vitrine (RF12)
const COLUNAS_CARD =
  'id, codigo_acervo, titulo, autor, descricao, genero, tematica, ano_publicacao, ' +
  'classificacao_etaria, status_disponibilidade, capa_url, media_estrelas, total_avaliacoes, created_at';

// ---------------------------------------------------------------------
// GET /api/livros
// Filtros combináveis (RF14–RF21):
//   ?busca=texto  &autor=  &genero=  &tematica=  &classificacao=L,10,12
//   &ano=1899  &status=disponivel  &ordem=az|za|nota|recentes
//   &pagina=1  &porPagina=12
// ---------------------------------------------------------------------
export async function listar(req, res) {
  const q = req.query;
  const pagina = inteiroOuNulo(q.pagina) || 1;
  const porPagina = Math.min(inteiroOuNulo(q.porPagina) || POR_PAGINA_PADRAO, POR_PAGINA_MAXIMO);
  const inicio = (pagina - 1) * porPagina;

  let consulta = supabasePublico.from('livros').select(COLUNAS_CARD, { count: 'exact' });

  // RF14 — busca por título, autor ou descrição
  const busca = limparBusca(q.busca);
  if (busca) {
    const termo = `%${busca}%`;
    consulta = consulta.or(`titulo.ilike.${termo},autor.ilike.${termo},descricao.ilike.${termo}`);
  }

  // RF16, RF17, RF18 — filtros de texto exato
  const autor = limparTexto(q.autor, { maximo: 150 });
  const genero = limparTexto(q.genero, { maximo: 60 });
  const tematica = limparTexto(q.tematica, { maximo: 60 });
  if (autor) consulta = consulta.eq('autor', autor);
  if (genero) consulta = consulta.eq('genero', genero);
  if (tematica) consulta = consulta.eq('tematica', tematica);

  // RF19 — classificação etária (aceita várias: "L,10,12")
  if (q.classificacao) {
    const faixas = String(q.classificacao)
      .split(',')
      .filter((c) => CLASSIFICACOES.includes(c));
    if (faixas.length) consulta = consulta.in('classificacao_etaria', faixas);
  }

  // RF20 — ano de publicação
  const ano = inteiroOuNulo(q.ano);
  if (ano) consulta = consulta.eq('ano_publicacao', ano);

  // Status do exemplar (extra útil para o aluno ver o que está disponível)
  if (STATUS_DISPONIBILIDADE.includes(q.status)) {
    consulta = consulta.eq('status_disponibilidade', q.status);
  }

  // RF15 — ordenação
  const ordem = ORDENACOES[q.ordem] || ORDENACOES.az;
  for (const { coluna, ascendente } of ordem) {
    consulta = consulta.order(coluna, { ascending: ascendente });
  }
  consulta = consulta.order('id', { ascending: true }); // desempate estável

  const { data, count } = verificar(await consulta.range(inicio, inicio + porPagina - 1));

  res.json({
    livros: data,
    total: count,
    pagina,
    porPagina,
    totalPaginas: Math.max(1, Math.ceil(count / porPagina)),
  });
}

// ---------------------------------------------------------------------
// GET /api/livros/opcoes-filtro
// Listas para preencher os <select> dos filtros com o que EXISTE no acervo
// ---------------------------------------------------------------------
export async function opcoesFiltro(_req, res) {
  const dados = verificar(
    await supabasePublico.from('livros').select('autor, genero, tematica, ano_publicacao').limit(10000),
  );

  const unicos = (campo) =>
    [...new Set(dados.map((l) => l[campo]).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), 'pt-BR'),
    );

  res.json({
    autores: unicos('autor'),
    generos: unicos('genero'),
    tematicas: unicos('tematica'),
    anos: unicos('ano_publicacao').sort((a, b) => b - a),
  });
}

// ---------------------------------------------------------------------
// GET /api/livros/destaques?limite=6  (RF30 — ranking dos mais bem avaliados)
// ---------------------------------------------------------------------
export async function destaques(req, res) {
  const limite = Math.min(inteiroOuNulo(req.query.limite) || 6, 20);

  const livros = verificar(
    await supabasePublico
      .from('livros')
      .select(COLUNAS_CARD)
      .gt('total_avaliacoes', 0)
      .order('media_estrelas', { ascending: false })
      .order('total_avaliacoes', { ascending: false })
      .limit(limite),
  );

  res.json({ livros });
}

// ---------------------------------------------------------------------
// GET /api/livros/:id  (RF13 — ficha completa)
// Se o usuário estiver logado, inclui a nota dele e se está nos favoritos.
// ---------------------------------------------------------------------
export async function buscarPorId(req, res) {
  const id = inteiroOuNulo(req.params.id);
  if (!id) throw naoEncontrado('Livro não encontrado.');

  const livro = verificar(await supabasePublico.from('livros').select('*').eq('id', id).maybeSingle());
  if (!livro) throw naoEncontrado('Livro não encontrado.');

  let minhaNota = null;
  let favorito = false;

  if (req.usuario) {
    const [avaliacao, fav] = await Promise.all([
      req.db.from('avaliacoes').select('nota').eq('livro_id', id).eq('usuario_id', req.usuario.id).maybeSingle(),
      req.db.from('favoritos').select('id').eq('livro_id', id).eq('usuario_id', req.usuario.id).maybeSingle(),
    ]);
    minhaNota = verificar(avaliacao)?.nota ?? null;
    favorito = Boolean(verificar(fav));
  }

  res.json({ livro, minhaNota, favorito });
}

// ---------------------------------------------------------------------
// POST /api/livros  (RF07)          — só equipe
// PUT  /api/livros/:id  (RF10)      — só equipe
// PATCH /api/livros/:id/status (RF08) — só equipe
// DELETE /api/livros/:id  (RF11)    — só equipe
// Usam req.db (token do usuário): a RLS confere de novo se é equipe.
// ---------------------------------------------------------------------
export async function criar(req, res) {
  const dados = validarLivro(req.body);
  const livro = verificar(await req.db.from('livros').insert(dados).select().single());
  res.status(201).json({ livro, mensagem: 'Livro cadastrado no acervo!' });
}

export async function atualizar(req, res) {
  const id = inteiroOuNulo(req.params.id);
  if (!id) throw naoEncontrado('Livro não encontrado.');

  const dados = validarLivro(req.body, { parcial: true });
  const livro = verificar(await req.db.from('livros').update(dados).eq('id', id).select().maybeSingle());
  if (!livro) throw naoEncontrado('Livro não encontrado.');

  res.json({ livro, mensagem: 'Livro atualizado!' });
}

export async function alterarStatus(req, res) {
  const id = inteiroOuNulo(req.params.id);
  if (!id) throw naoEncontrado('Livro não encontrado.');

  const dados = validarStatus(req.body);
  const livro = verificar(
    await req.db.from('livros').update(dados).eq('id', id).select('id, status_disponibilidade').maybeSingle(),
  );
  if (!livro) throw naoEncontrado('Livro não encontrado.');

  res.json({ livro, mensagem: 'Status atualizado!' });
}

export async function excluir(req, res) {
  const id = inteiroOuNulo(req.params.id);
  if (!id) throw naoEncontrado('Livro não encontrado.');

  const apagados = verificar(await req.db.from('livros').delete().eq('id', id).select('id'));
  if (!apagados.length) throw naoEncontrado('Livro não encontrado.');

  res.json({ mensagem: 'Livro removido do acervo.' });
}
