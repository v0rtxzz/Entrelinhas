// =====================================================================
// AVALIAÇÕES (estrelas de 1 a 5) — RF23, RF24
// A média do livro é recalculada pelo GATILHO do banco automaticamente.
// =====================================================================
import { supabasePublico } from '../config/supabase.js';
import { naoEncontrado, verificar } from '../utils/ErroApi.js';
import { inteiroOuNulo } from '../utils/sanitizar.js';
import { validarNota } from '../utils/validacoes.js';

async function garantirLivro(id) {
  const livro = verificar(await supabasePublico.from('livros').select('id').eq('id', id).maybeSingle());
  if (!livro) throw naoEncontrado('Livro não encontrado.');
}

async function mediaAtual(id) {
  return verificar(
    await supabasePublico.from('livros').select('media_estrelas, total_avaliacoes').eq('id', id).single(),
  );
}

/** Cria ou atualiza a nota do usuário logado (um voto por livro). */
export async function salvarNota(db, livroId, usuarioId, nota) {
  verificar(
    await db
      .from('avaliacoes')
      .upsert({ livro_id: livroId, usuario_id: usuarioId, nota }, { onConflict: 'livro_id,usuario_id' }),
  );
}

// PUT /api/livros/:id/avaliacao   { "nota": 4 }
export async function avaliar(req, res) {
  const livroId = inteiroOuNulo(req.params.id);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');
  await garantirLivro(livroId);

  const nota = validarNota(req.body?.nota);
  await salvarNota(req.db, livroId, req.usuario.id, nota);

  res.json({ minhaNota: nota, ...(await mediaAtual(livroId)), mensagem: 'Avaliação registrada!' });
}

// DELETE /api/livros/:id/avaliacao
export async function removerAvaliacao(req, res) {
  const livroId = inteiroOuNulo(req.params.id);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');

  verificar(await req.db.from('avaliacoes').delete().eq('livro_id', livroId).eq('usuario_id', req.usuario.id));

  res.json({ minhaNota: null, ...(await mediaAtual(livroId)), mensagem: 'Avaliação removida.' });
}
