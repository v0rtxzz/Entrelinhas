// =====================================================================
// PAINEL ADMINISTRATIVO — gestão de usuários (RF06)
// =====================================================================
import { ErroApi, naoEncontrado, verificar } from '../utils/ErroApi.js';
import { limparBusca } from '../utils/sanitizar.js';
import { validarAlteracaoUsuario } from '../utils/validacoes.js';

// GET /api/admin/usuarios?busca=ana
export async function listarUsuarios(req, res) {
  let consulta = req.db
    .from('perfis')
    .select('id, nome, email, turma_unidade, cargo, avatar_avela, ativo, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  const busca = limparBusca(req.query.busca);
  if (busca) consulta = consulta.or(`nome.ilike.%${busca}%,email.ilike.%${busca}%`);

  res.json({ usuarios: verificar(await consulta) });
}

// PATCH /api/admin/usuarios/:id   { cargo?: 'usuario'|'bibliotecaria'|'admin', ativo?: boolean }
export async function alterarUsuario(req, res) {
  const dados = validarAlteracaoUsuario(req.body);

  // Evita que o admin se tranque para fora do sistema sem querer
  if (req.params.id === req.usuario.id) {
    throw new ErroApi(400, 'Você não pode alterar o próprio cargo ou desativar a própria conta.');
  }

  const usuario = verificar(
    await req.db
      .from('perfis')
      .update(dados)
      .eq('id', req.params.id)
      .select('id, nome, email, turma_unidade, cargo, avatar_avela, ativo, created_at')
      .maybeSingle(),
  );
  if (!usuario) throw naoEncontrado('Usuário não encontrado.');

  res.json({ usuario, mensagem: 'Usuário atualizado!' });
}
