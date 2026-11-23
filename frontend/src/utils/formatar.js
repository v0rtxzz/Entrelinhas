// Pequenas funções de formatação usadas nas telas

export function formatarData(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatarMedia(media) {
  return Number(media || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function plural(qtd, singular, pluralTexto) {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
}

export function primeiroNome(nome = '') {
  return nome.trim().split(/\s+/)[0] || 'leitor(a)';
}
