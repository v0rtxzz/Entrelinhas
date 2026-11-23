// =====================================================================
// COMUNICAÇÃO COM O BACK-END
// ---------------------------------------------------------------------
// Toda chamada à API passa por aqui. A função "requisicao":
//   * monta a URL (VITE_API_URL + /api + caminho)
//   * coloca o token de login automaticamente
//   * transforma respostas de erro em ErroRequisicao (com mensagem
//     amigável e, se houver, os erros por campo do formulário)
// Embaixo ficam as funções de cada recurso, agrupadas por assunto.
// =====================================================================
import { supabase } from '../config/supabase.js';

const BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

export class ErroRequisicao extends Error {
  constructor(mensagem, status, detalhes) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes || {};
  }
}

async function requisicao(caminho, { metodo = 'GET', corpo, parametros } = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  let url = `${BASE}${caminho}`;
  if (parametros) {
    const limpos = Object.entries(parametros).filter(([, v]) => v !== undefined && v !== null && v !== '');
    if (limpos.length) url += `?${new URLSearchParams(limpos)}`;
  }

  let resposta;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers: {
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroRequisicao('Não foi possível falar com o servidor. Verifique sua internet.', 0);
  }

  const json = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new ErroRequisicao(json.erro || 'Algo deu errado. Tente novamente.', resposta.status, json.detalhes);
  }
  return json;
}

// ---------------------------------------------------------------------
// LIVROS
// ---------------------------------------------------------------------
export const livrosApi = {
  listar: (filtros) => requisicao('/livros', { parametros: filtros }),
  opcoesFiltro: () => requisicao('/livros/opcoes-filtro'),
  destaques: (limite = 6) => requisicao('/livros/destaques', { parametros: { limite } }),
  buscar: (id) => requisicao(`/livros/${id}`),
  criar: (livro) => requisicao('/livros', { metodo: 'POST', corpo: livro }),
  atualizar: (id, livro) => requisicao(`/livros/${id}`, { metodo: 'PUT', corpo: livro }),
  alterarStatus: (id, status) =>
    requisicao(`/livros/${id}/status`, { metodo: 'PATCH', corpo: { status_disponibilidade: status } }),
  excluir: (id) => requisicao(`/livros/${id}`, { metodo: 'DELETE' }),
};

// ---------------------------------------------------------------------
// AVALIAÇÕES E RESENHAS
// ---------------------------------------------------------------------
export const avaliacoesApi = {
  avaliar: (livroId, nota) => requisicao(`/livros/${livroId}/avaliacao`, { metodo: 'PUT', corpo: { nota } }),
  remover: (livroId) => requisicao(`/livros/${livroId}/avaliacao`, { metodo: 'DELETE' }),
};

export const resenhasApi = {
  doLivro: (livroId, ordem) => requisicao(`/livros/${livroId}/resenhas`, { parametros: { ordem } }),
  criar: (livroId, texto, nota) =>
    requisicao(`/livros/${livroId}/resenhas`, { metodo: 'POST', corpo: { texto, nota } }),
  editar: (id, texto) => requisicao(`/resenhas/${id}`, { metodo: 'PUT', corpo: { texto } }),
  excluir: (id) => requisicao(`/resenhas/${id}`, { metodo: 'DELETE' }),
  moderacao: (pagina) => requisicao('/resenhas', { parametros: { pagina } }),
};

// ---------------------------------------------------------------------
// FAVORITOS ("Quero Ler")
// ---------------------------------------------------------------------
export const favoritosApi = {
  listar: () => requisicao('/favoritos'),
  adicionar: (livroId) => requisicao(`/favoritos/${livroId}`, { metodo: 'POST' }),
  remover: (livroId) => requisicao(`/favoritos/${livroId}`, { metodo: 'DELETE' }),
};

// ---------------------------------------------------------------------
// PERFIL E ADMIN
// ---------------------------------------------------------------------
export const perfilApi = {
  meu: () => requisicao('/perfil'),
  atualizar: (dados) => requisicao('/perfil', { metodo: 'PATCH', corpo: dados }),
};

export const adminApi = {
  usuarios: (busca) => requisicao('/admin/usuarios', { parametros: { busca } }),
  alterarUsuario: (id, dados) => requisicao(`/admin/usuarios/${id}`, { metodo: 'PATCH', corpo: dados }),
};
