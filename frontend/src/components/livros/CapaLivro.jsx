// Capa do livro. Se não houver imagem (ou ela falhar), desenha uma capa
// ilustrada automática com as cores da paleta Avelã.
import { useState } from 'react';

const PALETAS = [
  { fundo: '#8a5a33', texto: '#fbf1e2', detalhe: '#e0b04b' },
  { fundo: '#5e7f4e', texto: '#fbf1e2', detalhe: '#e7d3b0' },
  { fundo: '#4a2e1c', texto: '#f4e3c9', detalhe: '#c8894b' },
  { fundo: '#c8894b', texto: '#3b2416', detalhe: '#fbf1e2' },
  { fundo: '#e7d3b0', texto: '#4a2e1c', detalhe: '#5e7f4e' },
  { fundo: '#6b4a3a', texto: '#fbf1e2', detalhe: '#9fbf8a' },
];

function indicePorTexto(texto = '') {
  let soma = 0;
  for (const letra of texto) soma = (soma * 31 + letra.charCodeAt(0)) % 9973;
  return soma % PALETAS.length;
}

export default function CapaLivro({ livro, tamanho = 'media' }) {
  const [falhou, setFalhou] = useState(false);

  if (livro.capa_url && !falhou) {
    return (
      <img
        className={`capa capa--${tamanho}`}
        src={livro.capa_url}
        alt={`Capa do livro ${livro.titulo}`}
        loading="lazy"
        onError={() => setFalhou(true)}
      />
    );
  }

  const cor = PALETAS[indicePorTexto(livro.titulo)];
  return (
    <div
      className={`capa capa--${tamanho} capa--gerada`}
      style={{ '--capa-fundo': cor.fundo, '--capa-texto': cor.texto, '--capa-detalhe': cor.detalhe }}
      role="img"
      aria-label={`Capa ilustrada de ${livro.titulo}`}
    >
      <svg className="capa__folhas" viewBox="0 0 60 60" aria-hidden="true">
        <path d="M30 58 C30 40 30 26 30 8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M30 40 C18 38 12 30 12 22 C22 22 29 30 30 40 Z" fill="currentColor" />
        <path d="M30 30 C42 28 48 20 48 12 C38 12 31 20 30 30 Z" fill="currentColor" />
        <path d="M30 18 C24 16 21 11 21 6 C27 6 30 11 30 18 Z" fill="currentColor" />
      </svg>
      <span className="capa__titulo">{livro.titulo}</span>
      <span className="capa__autor">{livro.autor}</span>
    </div>
  );
}
