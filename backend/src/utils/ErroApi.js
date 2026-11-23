// Erro "conhecido" da API: carrega o status HTTP e uma mensagem amigável
// que pode ser mostrada direto para o usuário no front-end.
export class ErroApi extends Error {
  constructor(status, mensagem, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

// Atalhos para os erros mais comuns
export const naoAutorizado = (msg = 'Faça login para continuar.') => new ErroApi(401, msg);
export const proibido = (msg = 'Você não tem permissão para fazer isso.') => new ErroApi(403, msg);
export const naoEncontrado = (msg = 'Não encontrado.') => new ErroApi(404, msg);
export const dadosInvalidos = (detalhes) =>
  new ErroApi(400, 'Alguns campos precisam de atenção.', detalhes);

// Converte erros do Supabase/PostgreSQL em ErroApi com mensagem em português
export function traduzirErroSupabase(erro) {
  if (!erro) return null;

  switch (erro.code) {
    case '23505': // unique_violation
      return new ErroApi(409, 'Já existe um registro com esses dados (ex.: código do acervo repetido).');
    case '23503': // foreign_key_violation
      return new ErroApi(400, 'Registro relacionado não encontrado.');
    case '23514': // check_violation
      return new ErroApi(400, 'Algum valor está fora do permitido.');
    case '42501': // insufficient_privilege (RLS ou gatilho de proteção)
      return proibido();
    case 'PGRST116': // .single() não encontrou nada
      return naoEncontrado();
    default:
      return new ErroApi(500, 'Erro ao acessar o banco de dados.', erro.message);
  }
}

// Lança o erro traduzido se a resposta do Supabase tiver erro
export function verificar({ data, error, count }) {
  if (error) throw traduzirErroSupabase(error);
  return count === undefined || count === null ? data : { data, count };
}
