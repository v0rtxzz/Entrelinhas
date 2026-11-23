// Validações dos dados que chegam do front-end (RNF09).
// Cada função devolve os dados JÁ LIMPOS ou lança um erro 400 com a
// lista de campos com problema (o front mostra embaixo de cada campo).
import { dadosInvalidos } from './ErroApi.js';
import { limparTexto } from './sanitizar.js';
import { AVATARES, CARGOS, CLASSIFICACOES, STATUS_DISPONIBILIDADE } from './constantes.js';

const ANO_ATUAL = new Date().getFullYear();

// ---------------------------------------------------------------------
// LIVRO (RF07, RF10)
// parcial = true -> aceita só alguns campos (edição)
// ---------------------------------------------------------------------
export function validarLivro(corpo = {}, { parcial = false } = {}) {
  const erros = {};
  const dados = {};

  const texto = (campo, { obrigatorio = false, maximo, multilinha = false, rotulo }) => {
    if (parcial && corpo[campo] === undefined) return;
    const valor = limparTexto(corpo[campo], { maximo, multilinha });
    if (obrigatorio && !valor) erros[campo] = `${rotulo} é obrigatório.`;
    dados[campo] = valor || null;
  };

  texto('codigo_acervo', { obrigatorio: true, maximo: 30, rotulo: 'Código do acervo' });
  texto('titulo', { obrigatorio: true, maximo: 200, rotulo: 'Título' });
  texto('autor', { obrigatorio: true, maximo: 150, rotulo: 'Autor' });
  texto('genero', { obrigatorio: true, maximo: 60, rotulo: 'Gênero' });
  texto('tematica', { maximo: 60, rotulo: 'Temática' });
  texto('descricao', { maximo: 500, multilinha: true, rotulo: 'Descrição' });
  texto('sinopse', { maximo: 5000, multilinha: true, rotulo: 'Sinopse' });

  if (!parcial || corpo.ano_publicacao !== undefined) {
    if (corpo.ano_publicacao === '' || corpo.ano_publicacao === null || corpo.ano_publicacao === undefined) {
      dados.ano_publicacao = null;
    } else {
      const ano = Number(corpo.ano_publicacao);
      if (!Number.isInteger(ano) || ano < 1000 || ano > ANO_ATUAL + 1) {
        erros.ano_publicacao = `Ano deve ser um número entre 1000 e ${ANO_ATUAL + 1}.`;
      } else {
        dados.ano_publicacao = ano;
      }
    }
  }

  if (!parcial || corpo.classificacao_etaria !== undefined) {
    if (!CLASSIFICACOES.includes(corpo.classificacao_etaria)) {
      erros.classificacao_etaria = 'Escolha uma classificação etária válida.';
    } else {
      dados.classificacao_etaria = corpo.classificacao_etaria;
    }
  }

  if (!parcial || corpo.status_disponibilidade !== undefined) {
    const status = corpo.status_disponibilidade ?? 'disponivel';
    if (!STATUS_DISPONIBILIDADE.includes(status)) {
      erros.status_disponibilidade = 'Status inválido.';
    } else {
      dados.status_disponibilidade = status;
    }
  }

  if (!parcial || corpo.capa_url !== undefined) {
    const url = limparTexto(corpo.capa_url, { maximo: 1000 });
    if (url && !/^https:\/\/\S+$/i.test(url)) {
      erros.capa_url = 'A capa precisa ser um link começando com https://';
    }
    dados.capa_url = url || null;
  }

  if (Object.keys(erros).length) throw dadosInvalidos(erros);
  return dados;
}

// ---------------------------------------------------------------------
// STATUS DO EXEMPLAR (RF08)
// ---------------------------------------------------------------------
export function validarStatus(corpo = {}) {
  if (!STATUS_DISPONIBILIDADE.includes(corpo.status_disponibilidade)) {
    throw dadosInvalidos({ status_disponibilidade: 'Status inválido.' });
  }
  return { status_disponibilidade: corpo.status_disponibilidade };
}

// ---------------------------------------------------------------------
// NOTA (RF23 / RNF09): só inteiros de 1 a 5
// ---------------------------------------------------------------------
export function validarNota(valor) {
  const nota = Number(valor);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw dadosInvalidos({ nota: 'A nota deve ser um número inteiro de 1 a 5.' });
  }
  return nota;
}

// ---------------------------------------------------------------------
// RESENHA (RF25)
// ---------------------------------------------------------------------
export function validarResenha(corpo = {}) {
  const texto = limparTexto(corpo.texto, { maximo: 2000, multilinha: true });
  if (texto.length < 3) {
    throw dadosInvalidos({ texto: 'Escreva pelo menos 3 caracteres.' });
  }
  return { texto };
}

// ---------------------------------------------------------------------
// PERFIL (RF04) — o próprio usuário só muda nome, turma e avatar
// ---------------------------------------------------------------------
export function validarPerfil(corpo = {}) {
  const erros = {};
  const dados = {};

  if (corpo.nome !== undefined) {
    const nome = limparTexto(corpo.nome, { maximo: 120 });
    if (nome.length < 2) erros.nome = 'Informe seu nome.';
    dados.nome = nome;
  }
  if (corpo.turma_unidade !== undefined) {
    dados.turma_unidade = limparTexto(corpo.turma_unidade, { maximo: 120 }) || null;
  }
  if (corpo.avatar_avela !== undefined) {
    if (!AVATARES.includes(corpo.avatar_avela)) erros.avatar_avela = 'Avatar inválido.';
    dados.avatar_avela = corpo.avatar_avela;
  }

  if (Object.keys(erros).length) throw dadosInvalidos(erros);
  if (!Object.keys(dados).length) throw dadosInvalidos({ geral: 'Nada para atualizar.' });
  return dados;
}

// ---------------------------------------------------------------------
// GESTÃO DE USUÁRIOS PELO ADMIN (RF06)
// ---------------------------------------------------------------------
export function validarAlteracaoUsuario(corpo = {}) {
  const erros = {};
  const dados = {};

  if (corpo.cargo !== undefined) {
    if (!CARGOS.includes(corpo.cargo)) erros.cargo = 'Cargo inválido.';
    dados.cargo = corpo.cargo;
  }
  if (corpo.ativo !== undefined) {
    if (typeof corpo.ativo !== 'boolean') erros.ativo = 'Valor inválido.';
    dados.ativo = corpo.ativo;
  }

  if (Object.keys(erros).length) throw dadosInvalidos(erros);
  if (!Object.keys(dados).length) throw dadosInvalidos({ geral: 'Nada para atualizar.' });
  return dados;
}
