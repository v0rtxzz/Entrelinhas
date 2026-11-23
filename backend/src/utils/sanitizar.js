// Limpeza de textos digitados pelos usuários (RNF10 — prevenção de XSS).
//
// O React já escapa tudo o que exibe, então esta é uma SEGUNDA camada:
// garantimos que nenhuma tag HTML/script fique gravada no banco.

/** Remove tags HTML, caracteres de controle e espaços sobrando. */
export function limparTexto(valor, { maximo = 5000, multilinha = false } = {}) {
  if (valor === undefined || valor === null) return '';

  let texto = String(valor)
    .replace(/<[^>]*>/g, '') // tags HTML
    .replace(/[<>]/g, '') // sobras de < ou >
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''); // controle

  texto = multilinha
    ? texto.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n') // no máx. 1 linha em branco
    : texto.replace(/\s+/g, ' ');

  return texto.trim().slice(0, maximo);
}

/**
 * Prepara um termo de busca para o filtro .or() do Supabase.
 * Remove caracteres que têm significado especial na sintaxe do filtro
 * (vírgula, parênteses, %, *, etc.), evitando "injeção de filtro".
 */
export function limparBusca(valor) {
  return limparTexto(valor, { maximo: 80 })
    .replace(/[,()%*\\:"'.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Converte para inteiro positivo ou devolve null. */
export function inteiroOuNulo(valor) {
  const numero = Number.parseInt(valor, 10);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}
