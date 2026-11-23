// =====================================================================
// ESTRELAS (RF23)
// <Estrelas valor={4.3} />                  -> só mostra (aceita fração)
// <SeletorEstrelas valor={nota} aoMudar={...} /> -> o usuário escolhe 1 a 5
// =====================================================================
import { useState } from 'react';

const CAMINHO_ESTRELA =
  'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z';

function Estrela({ preenchimento = 0, tamanho = 18 }) {
  // preenchimento de 0 a 1 (permite meia estrela, ex.: 0.5)
  const id = `grad-${Math.round(preenchimento * 100)}`;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" className="estrela">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${preenchimento * 100}%`} stopColor="var(--cor-estrela)" />
          <stop offset={`${preenchimento * 100}%`} stopColor="var(--cor-estrela-vazia)" />
        </linearGradient>
      </defs>
      <path d={CAMINHO_ESTRELA} fill={`url(#${id})`} stroke="var(--cor-estrela-borda)" strokeWidth="1" />
    </svg>
  );
}

export function Estrelas({ valor = 0, tamanho = 18, mostrarNumero = false, total }) {
  const nota = Number(valor) || 0;
  return (
    <span className="estrelas" title={`${nota.toFixed(1)} de 5`}>
      <span className="sr-only">Nota {nota.toFixed(1)} de 5</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <Estrela key={n} tamanho={tamanho} preenchimento={Math.max(0, Math.min(1, nota - (n - 1)))} />
      ))}
      {mostrarNumero && (
        <span className="estrelas__numero">
          {nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          {total !== undefined && <span className="estrelas__total"> ({total})</span>}
        </span>
      )}
    </span>
  );
}

export function SeletorEstrelas({ valor, aoMudar, desabilitado = false, tamanho = 30, rotulo = 'Sua nota' }) {
  const [destaque, setDestaque] = useState(0);
  const exibido = destaque || valor || 0;
  const textos = ['', 'Não gostei', 'Mais ou menos', 'Bom', 'Muito bom', 'Amei!'];

  return (
    <div className="seletor-estrelas" role="radiogroup" aria-label={rotulo} onMouseLeave={() => setDestaque(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'} — ${textos[n]}`}
          disabled={desabilitado}
          onMouseEnter={() => setDestaque(n)}
          onFocus={() => setDestaque(n)}
          onBlur={() => setDestaque(0)}
          onClick={() => aoMudar(n)}
        >
          <Estrela preenchimento={n <= exibido ? 1 : 0} tamanho={tamanho} />
        </button>
      ))}
      <span className="seletor-estrelas__texto" aria-hidden="true">
        {textos[exibido]}
      </span>
    </div>
  );
}
