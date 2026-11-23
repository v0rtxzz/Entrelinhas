// =====================================================================
// FAVORITOS — lista "Quero Ler" (RF29)
// =====================================================================
import { supabasePublico } from '../config/supabase.js';
import { naoEncontrado, verificar } from '../utils/ErroApi.js';
import { inteiroOuNulo } from '../utils/sanitizar.js';

// GET /api/favoritos — livros salvos pelo usuário logado
export async function listar(req, res) {
  const favoritos = verificar(
    await req.db
      .from('favoritos')
      .select(
        'created_at, livros ( id, titulo, autor, genero, capa_url, classificacao_etaria, ' +
          'status_disponibilidade, media_estrelas, total_avaliacoes )',
      )
      .eq('usuario_id', req.usuario.id)
      .order('created_at', { ascending: false }),
  );

  res.json({ livros: favoritos.map((f) => f.livros).filter(Boolean) });
}

// POST /api/favoritos/:livroId
export async function adicionar(req, res) {
  const livroId = inteiroOuNulo(req.params.livroId);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');

  const livro = verificar(await supabasePublico.from('livros').select('id').eq('id', livroId).maybeSingle());
  if (!livro) throw naoEncontrado('Livro não encontrado.');

  // upsert + ignoreDuplicates: clicar duas vezes não dá erro
  verificar(
    await req.db
      .from('favoritos')
      .upsert({ livro_id: livroId, usuario_id: req.usuario.id }, { onConflict: 'livro_id,usuario_id', ignoreDuplicates: true }),
  );

  res.status(201).json({ favorito: true, mensagem: 'Adicionado à sua lista "Quero Ler"!' });
}

// DELETE /api/favoritos/:livroId
export async function remover(req, res) {
  const livroId = inteiroOuNulo(req.params.livroId);
  if (!livroId) throw naoEncontrado('Livro não encontrado.');

  verificar(await req.db.from('favoritos').delete().eq('livro_id', livroId).eq('usuario_id', req.usuario.id));

  res.json({ favorito: false, mensagem: 'Removido da lista "Quero Ler".' });
}
