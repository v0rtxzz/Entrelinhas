// Middlewares de login e permissão.
//
// O front-end faz login direto no Supabase Auth e manda o token em
// cada requisição no cabeçalho:  Authorization: Bearer <token>
//
//   autenticar          -> rota exige login
//   autenticarOpcional  -> rota funciona sem login, mas usa se tiver
//   exigirCargo(...)    -> rota exige um cargo específico (RF05, RF06)
//
// Depois deles, cada controller tem disponível:
//   req.usuario -> { id, nome, email, cargo, ativo, ... } ou null
//   req.db      -> cliente Supabase "em nome do usuário" (RLS aplicada)
import { supabasePublico, clienteDoUsuario } from '../config/supabase.js';
import { naoAutorizado, proibido } from '../utils/ErroApi.js';

function lerToken(req) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');
  return tipo?.toLowerCase() === 'bearer' && token ? token : null;
}

async function carregarUsuario(token) {
  const { data, error } = await supabasePublico.auth.getUser(token);
  if (error || !data?.user) throw naoAutorizado('Sua sessão expirou. Entre novamente.');

  const db = clienteDoUsuario(token);
  const { data: perfil, error: erroPerfil } = await db
    .from('perfis')
    .select('id, nome, email, turma_unidade, cargo, avatar_avela, ativo, created_at')
    .eq('id', data.user.id)
    .single();

  if (erroPerfil || !perfil) throw naoAutorizado('Perfil não encontrado.');
  if (!perfil.ativo) throw proibido('Sua conta está desativada. Procure a biblioteca.');

  return { usuario: perfil, db };
}

export async function autenticar(req, _res, next) {
  const token = lerToken(req);
  if (!token) throw naoAutorizado();

  const { usuario, db } = await carregarUsuario(token);
  req.usuario = usuario;
  req.db = db;
  next();
}

export async function autenticarOpcional(req, _res, next) {
  const token = lerToken(req);
  req.usuario = null;
  req.db = supabasePublico;

  if (token) {
    try {
      const { usuario, db } = await carregarUsuario(token);
      req.usuario = usuario;
      req.db = db;
    } catch {
      // Token inválido em rota pública: segue como visitante.
    }
  }
  next();
}

/** Uso: router.post('/', autenticar, exigirCargo('bibliotecaria', 'admin'), ...) */
export function exigirCargo(...cargosPermitidos) {
  return (req, _res, next) => {
    if (!req.usuario) throw naoAutorizado();
    if (!cargosPermitidos.includes(req.usuario.cargo)) throw proibido();
    next();
  };
}

// Atalhos legíveis para as rotas
export const somenteEquipe = exigirCargo('bibliotecaria', 'admin');
export const somenteAdmin = exigirCargo('admin');
