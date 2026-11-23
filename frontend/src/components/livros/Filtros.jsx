// =====================================================================
// FILTROS DO ACERVO — RF14 a RF21
// Todos combináveis. O estado fica na URL (?genero=Romance&ordem=nota),
// então dá para compartilhar o link de uma busca.
// =====================================================================
import { useState } from 'react';
import { CLASSIFICACOES, ORDENACOES, STATUS } from '../../utils/constantes.js';

export default function Filtros({ filtros, opcoes, aoMudar, aoLimpar, temFiltroAtivo }) {
  const [abertoNoCelular, setAbertoNoCelular] = useState(false);
  const classificacoesMarcadas = filtros.classificacao ? filtros.classificacao.split(',') : [];

  function alternarClassificacao(valor) {
    const nova = classificacoesMarcadas.includes(valor)
      ? classificacoesMarcadas.filter((c) => c !== valor)
      : [...classificacoesMarcadas, valor];
    aoMudar('classificacao', nova.join(','));
  }

  return (
    <section className="filtros" aria-label="Busca e filtros do acervo">
      <div className="filtros__linha-principal">
        <label className="filtros__busca">
          <span className="sr-only">Buscar por título, autor ou descrição</span>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Buscar por título, autor ou assunto…"
            value={filtros.buscaDigitada}
            onChange={(e) => aoMudar('busca', e.target.value)}
          />
        </label>

        <label className="filtros__ordem">
          <span>Ordenar</span>
          <select value={filtros.ordem || 'az'} onChange={(e) => aoMudar('ordem', e.target.value)}>
            {ORDENACOES.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="botao botao--fantasma filtros__alternar"
          aria-expanded={abertoNoCelular}
          onClick={() => setAbertoNoCelular((v) => !v)}
        >
          {abertoNoCelular ? 'Esconder filtros' : 'Mais filtros'}
        </button>
      </div>

      <div className={`filtros__avancados ${abertoNoCelular ? 'aberto' : ''}`}>
        <label>
          <span>Autor</span>
          <select value={filtros.autor || ''} onChange={(e) => aoMudar('autor', e.target.value)}>
            <option value="">Todos</option>
            {opcoes.autores.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Gênero</span>
          <select value={filtros.genero || ''} onChange={(e) => aoMudar('genero', e.target.value)}>
            <option value="">Todos</option>
            {opcoes.generos.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Temática</span>
          <select value={filtros.tematica || ''} onChange={(e) => aoMudar('tematica', e.target.value)}>
            <option value="">Todas</option>
            {opcoes.tematicas.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Ano</span>
          <select value={filtros.ano || ''} onChange={(e) => aoMudar('ano', e.target.value)}>
            <option value="">Todos</option>
            {opcoes.anos.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Disponibilidade</span>
          <select value={filtros.status || ''} onChange={(e) => aoMudar('status', e.target.value)}>
            <option value="">Todas</option>
            {STATUS.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="filtros__idades">
          <legend>Classificação etária</legend>
          <div>
            {CLASSIFICACOES.map((c) => (
              <button
                key={c.valor}
                type="button"
                className={`chip-idade selo-idade--${c.valor} ${classificacoesMarcadas.includes(c.valor) ? 'ativo' : ''}`}
                aria-pressed={classificacoesMarcadas.includes(c.valor)}
                onClick={() => alternarClassificacao(c.valor)}
                title={c.rotulo}
              >
                {c.curto}
              </button>
            ))}
          </div>
        </fieldset>

        {temFiltroAtivo && (
          <button type="button" className="botao botao--fantasma filtros__limpar" onClick={aoLimpar}>
            ✕ Limpar filtros
          </button>
        )}
      </div>
    </section>
  );
}
