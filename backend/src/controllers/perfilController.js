// =====================================================================
// PERFIL DO USUÁRIO LOGADO — RF04
// =====================================================================
import { verificar } from '../utils/ErroApi.js';
import { validarPerfil } from '../utils/validacoes.js';

// GET /api/perfil — dados do perfil + resenhas que o usuário escreveu
export async function meuPerfil(req, res) {
  const resenhas = verificar(
    await req.db
      .from('resenhas')
      .select('id, texto, created_at, updated_at, livros ( id, titulo, autor )')
      .eq('usuario_id', req.usuario.id)
      .order('created_at', { ascending: false }),
  );

  res.json({ perfil: req.usuario, resenhas });
}

// PATCH /api/perfil   { nome?, turma_unidade?, avatar_avela? }
export async function atualizar(req, res) {
  const dados = validarPerfil(req.body);

  const perfil = verificar(
    await req.db
      .from('perfis')
      .update(dados)
      .eq('id', req.usuario.id)
      .select('id, nome, email, turma_unidade, cargo, avatar_avela, ativo, created_at')
      .single(),
  );

  res.json({ perfil, mensagem: 'Perfil atualizado!' });
}
