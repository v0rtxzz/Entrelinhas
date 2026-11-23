// =====================================================================
// RESENHAS — RF25, RF26, RF27, RF28
// =====================================================================
import { supabasePublico } from '../config/supabase.js';
import { naoEncontrado, verificar } from '../utils/ErroApi.js';
import { inteiroOuNulo } from '../utils/sanitizar.js';
import { validarNota, validarResenha } from '../utils/validacoes.js';
import { salvarNota } from './avaliacoesController.js';

// Busca nome/avatar públicos dos autores (função SQL perfis_publicos)
async function anexarAutores(resenhas) {
  const ids = [...new Set(resenhas.map((r) => r.usuario_id))];
  if (!ids.length) return resenhas;

  const perfis = verificar(await supabasePublico.rpc('perfis_publicos', { ids }));
  const porId = Object.fromEntries(perfis.map((p) => [p.id, p]));

  return resenhas.map((r) => ({
    ...r,
    autor: porId[r.usuario_id] || { nome: 'Leitor(a)', avatar_avela: 'classico' },
  }));
}

// ---------------------------------------------------------------------
// GET /api/livros/:id/resenhas?ordem=recentes|notas   (RF27)
// Cada resenha vem com o nome do autor e a nota que ele deu ao livro.
// ---------------------------------------------------------------------
export async function listarDoLivro(req, res) {
  const livroId = inteiroOuNulo(req.params.id);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');

  const [resenhasResp, notasResp] = await Promise.all([
    supabasePublico
      .from('resenhas')
      .select('id, livro_id, usuario_id, texto, created_at, updated_at')
      .eq('livro_id', livroId)
      .order('created_at', { ascending: false })
      .limit(200),
    supabasePublico.from('avaliacoes').select('usuario_id, nota').eq('livro_id', livroId),
  ]);

  const notaPorUsuario = Object.fromEntries(verificar(notasResp).map((a) => [a.usuario_id, a.nota]));
  let resenhas = verificar(resenhasResp).map((r) => ({ ...r, nota: notaPorUsuario[r.usuario_id] ?? null }));

  if (req.query.ordem === 'notas') {
    resenhas.sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0) || new Date(b.created_at) - new Date(a.created_at));
  }

  resenhas = await anexarAutores(resenhas);
  res.json({ resenhas });
}

// ---------------------------------------------------------------------
// POST /api/livros/:id/resenhas   { "texto": "...", "nota": 5 }  (RF25)
// A nota é opcional; se vier, já registra/atualiza a avaliação junto.
// ---------------------------------------------------------------------
export async function criar(req, res) {
  const livroId = inteiroOuNulo(req.params.id);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');

  const livro = verificar(await supabasePublico.from('livros').select('id').eq('id', livroId).maybeSingle());
  if (!livro) throw naoEncontrado('Livro não encontrado.');

  const { texto } = validarResenha(req.body);
  const nota = req.body?.nota !== undefined && req.body?.nota !== null ? validarNota(req.body.nota) : null;

  if (nota) await salvarNota(req.db, livroId, req.usuario.id, nota);

  const resenha = verificar(
    await req.db
      .from('resenhas')
      .insert({ livro_id: livroId, usuario_id: req.usuario.id, texto })
      .select('id, livro_id, usuario_id, texto, created_at, updated_at')
      .single(),
  );

  res.status(201).json({
    resenha: {
      ...resenha,
      nota,
      autor: { nome: req.usuario.nome, avatar_avela: req.usuario.avatar_avela, cargo: req.usuario.cargo },
    },
    mensagem: 'Resenha publicada! Obrigado por ajudar outros leitores.',
  });
}

// ---------------------------------------------------------------------
// PUT /api/resenhas/:id   { "texto": "..." }   (RF26 — só a própria)
// ---------------------------------------------------------------------
export async function editar(req, res) {
  const { texto } = validarResenha(req.body);

  const resenha = verificar(
    await req.db
      .from('resenhas')
      .update({ texto })
      .eq('id', req.params.id)
      .eq('usuario_id', req.usuario.id)
      .select('id, livro_id, usuario_id, texto, created_at, updated_at')
      .maybeSingle(),
  );
  if (!resenha) throw naoEncontrado('Resenha não encontrada ou não é sua.');

  res.json({ resenha, mensagem: 'Resenha atualizada!' });
}

// ---------------------------------------------------------------------
// DELETE /api/resenhas/:id
// Usuário apaga a própria (RF26); equipe pode apagar qualquer uma (RF28).
// Quem decide é a RLS do banco.
// ---------------------------------------------------------------------
export async function excluir(req, res) {
  const apagadas = verificar(await req.db.from('resenhas').delete().eq('id', req.params.id).select('id'));
  if (!apagadas.length) throw naoEncontrado('Resenha não encontrada ou sem permissão para excluir.');

  res.json({ mensagem: 'Resenha excluída.' });
}

// ---------------------------------------------------------------------
// GET /api/resenhas?pagina=1   — lista geral para MODERAÇÃO (equipe)
// ---------------------------------------------------------------------
export async function listarParaModeracao(req, res) {
  const pagina = inteiroOuNulo(req.query.pagina) || 1;
  const porPagina = 20;
  const inicio = (pagina - 1) * porPagina;

  const { data, count } = verificar(
    await req.db
      .from('resenhas')
      .select('id, livro_id, usuario_id, texto, created_at, livros ( id, titulo )', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(inicio, inicio + porPagina - 1),
  );

  res.json({
    resenhas: await anexarAutores(data),
    total: count,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(count / porPagina)),
  });
}
