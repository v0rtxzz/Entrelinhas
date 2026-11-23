// =====================================================================
// FICHA COMPLETA DO LIVRO — RF13, RF23, RF29 (+ RF08 atalho da equipe)
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { avaliacoesApi, favoritosApi, livrosApi } from '../services/api.js';
import { CLASSIFICACOES, STATUS, rotuloDe } from '../utils/constantes.js';
import { formatarMedia, plural } from '../utils/formatar.js';
import EstadoVazio from '../components/avela/EstadoVazio.jsx';
import TelaCarregamento from '../components/avela/TelaCarregamento.jsx';
import CapaLivro from '../components/livros/CapaLivro.jsx';
import { Estrelas, SeletorEstrelas } from '../components/livros/Estrelas.jsx';
import { SeloClassificacao, SeloStatus } from '../components/livros/Selos.jsx';
import SecaoResenhas from '../components/resenhas/SecaoResenhas.jsx';

export default function DetalheLivro() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logado, ehEquipe, carregando: carregandoAuth } = useAuth();
  const { avisar } = useToast();

  const [livro, setLivro] = useState(null);
  const [minhaNota, setMinhaNota] = useState(null);
  const [favorito, setFavorito] = useState(false);
  const [estado, setEstado] = useState('carregando'); // carregando | pronto | nao-encontrado
  const [salvandoNota, setSalvandoNota] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const dados = await livrosApi.buscar(id);
      setLivro(dados.livro);
      setMinhaNota(dados.minhaNota);
      setFavorito(dados.favorito);
      setEstado('pronto');
    } catch (erro) {
      setEstado(erro.status === 404 ? 'nao-encontrado' : 'pronto');
      if (erro.status !== 404) avisar(erro.message, 'erro');
    }
  }, [id, avisar]);

  // Espera saber se está logado (para trazer a nota e o favorito do usuário)
  useEffect(() => {
    if (!carregandoAuth) carregar();
  }, [carregar, carregandoAuth, logado]);

  // RF23 + RF24 — o servidor devolve a média já recalculada
  async function avaliar(nota) {
    if (!logado) {
      navigate('/entrar', { state: { voltarPara: `/livros/${id}` } });
      return;
    }
    setSalvandoNota(true);
    try {
      const r = await avaliacoesApi.avaliar(id, nota);
      setMinhaNota(r.minhaNota);
      setLivro((l) => ({ ...l, media_estrelas: r.media_estrelas, total_avaliacoes: r.total_avaliacoes }));
      avisar(r.mensagem);
    } catch (erro) {
      avisar(erro.message, 'erro');
    } finally {
      setSalvandoNota(false);
    }
  }

  // RF29 — lista "Quero Ler"
  async function alternarFavorito() {
    if (!logado) {
      navigate('/entrar', { state: { voltarPara: `/livros/${id}` } });
      return;
    }
    try {
      const r = favorito ? await favoritosApi.remover(id) : await favoritosApi.adicionar(id);
      setFavorito(r.favorito);
      avisar(r.mensagem);
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  }

  // RF08 — atalho da equipe para mudar a disponibilidade
  async function mudarStatus(status) {
    try {
      const r = await livrosApi.alterarStatus(id, status);
      setLivro((l) => ({ ...l, status_disponibilidade: r.livro.status_disponibilidade }));
      avisar(r.mensagem);
    } catch (erro) {
      avisar(erro.message, 'erro');
    }
  }

  if (estado === 'carregando') return <TelaCarregamento telaCheia={false} />;

  if (estado === 'nao-encontrado' || !livro) {
    return (
      <div className="container">
        <EstadoVazio titulo="Livro não encontrado" mensagem="Talvez ele tenha saído do acervo." expressao="preocupado">
          <Link to="/" className="botao botao--primario">
            Voltar ao acervo
          </Link>
        </EstadoVazio>
      </div>
    );
  }

  return (
    <div className="container detalhe">
      <Link to="/" className="voltar">
        ← Voltar ao acervo
      </Link>

      <article className="detalhe__ficha">
        <div className="detalhe__capa">
          <CapaLivro livro={livro} tamanho="grande" />
          <button
            type="button"
            className={`botao ${favorito ? 'botao--verde' : 'botao--fantasma'} botao--bloco`}
            onClick={alternarFavorito}
            aria-pressed={favorito}
          >
            {favorito ? '♥ Na lista Quero Ler' : '♡ Quero Ler'}
          </button>
        </div>

        <div className="detalhe__info">
          <div className="detalhe__selos">
            <SeloClassificacao valor={livro.classificacao_etaria} grande />
            <SeloStatus valor={livro.status_disponibilidade} />
            <span className="etiqueta">{livro.genero}</span>
            {livro.tematica && <span className="etiqueta etiqueta--verde">{livro.tematica}</span>}
          </div>

          <h1 className="detalhe__titulo">{livro.titulo}</h1>
          <p className="detalhe__autor">por {livro.autor}</p>

          <div className="detalhe__nota">
            <span className="detalhe__media">{formatarMedia(livro.media_estrelas)}</span>
            <div>
              <Estrelas valor={livro.media_estrelas} tamanho={22} />
              <small>{plural(livro.total_avaliacoes, 'avaliação', 'avaliações')}</small>
            </div>
          </div>

          <div className="cartao detalhe__minha-nota">
            <span>{minhaNota ? 'Sua avaliação' : 'Avalie este livro'}</span>
            <SeletorEstrelas valor={minhaNota} aoMudar={avaliar} desabilitado={salvandoNota} />
          </div>

          {livro.descricao && <p className="detalhe__descricao">{livro.descricao}</p>}

          {livro.sinopse && (
            <section>
              <h2 className="titulo-pequeno">Sinopse</h2>
              <p className="detalhe__sinopse">{livro.sinopse}</p>
            </section>
          )}

          <dl className="detalhe__dados">
            <div>
              <dt>Código no acervo</dt>
              <dd>{livro.codigo_acervo}</dd>
            </div>
            <div>
              <dt>Ano de publicação</dt>
              <dd>{livro.ano_publicacao || '—'}</dd>
            </div>
            <div>
              <dt>Gênero</dt>
              <dd>{livro.genero}</dd>
            </div>
            <div>
              <dt>Temática</dt>
              <dd>{livro.tematica || '—'}</dd>
            </div>
            <div>
              <dt>Classificação</dt>
              <dd>{rotuloDe(CLASSIFICACOES, livro.classificacao_etaria)}</dd>
            </div>
            <div>
              <dt>Situação</dt>
              <dd>{rotuloDe(STATUS, livro.status_disponibilidade)}</dd>
            </div>
          </dl>

          {ehEquipe && (
            <div className="cartao cartao--equipe">
              <strong>Área da equipe</strong>
              <label className="campo-inline">
                <span>Situação do exemplar</span>
                <select value={livro.status_disponibilidade} onChange={(e) => mudarStatus(e.target.value)}>
                  {STATUS.map((s) => (
                    <option key={s.valor} value={s.valor}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <Link to={`/painel/livros/${livro.id}/editar`} className="botao botao--fantasma botao--p">
                Editar livro
              </Link>
            </div>
          )}
        </div>
      </article>

      <SecaoResenhas livroId={livro.id} minhaNota={minhaNota} aoAvaliar={avaliar} />
    </div>
  );
}
