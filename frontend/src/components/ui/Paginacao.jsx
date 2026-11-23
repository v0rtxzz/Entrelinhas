export default function Paginacao({ pagina, totalPaginas, aoMudar }) {
  if (totalPaginas <= 1) return null;

  return (
    <nav className="paginacao" aria-label="Páginas">
      <button type="button" className="botao botao--fantasma botao--p" disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)}>
        ← Anterior
      </button>
      <span>
        Página <strong>{pagina}</strong> de {totalPaginas}
      </span>
      <button
        type="button"
        className="botao botao--fantasma botao--p"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
      >
        Próxima →
      </button>
    </nav>
  );
}
