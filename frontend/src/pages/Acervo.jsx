// =====================================================================
// PÁGINA INICIAL — Vitrine do acervo
// RF12 (cards), RF14–RF22 (busca, filtros, estado vazio), RF30 (destaques)
// =====================================================================
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { livrosApi } from '../services/api.js';
import { plural, primeiroNome } from '../utils/formatar.js';
import Avela from '../components/avela/Avela.jsx';
import EstadoVazio from '../components/avela/EstadoVazio.jsx';
import TelaCarregamento from '../components/avela/TelaCarregamento.jsx';
import CardLivro from '../components/livros/CardLivro.jsx';
import Filtros from '../components/livros/Filtros.jsx';
import Paginacao from '../components/ui/Paginacao.jsx';

// Filtros que ficam guardados na URL
const CAMPOS_FILTRO = ['busca', 'autor', 'genero', 'tematica', 'classificacao', 'ano', 'status', 'ordem', 'pagina'];

export default function Acervo() {
  const { perfil } = useAuth();
  const { avisar } = useToast();
  const [params, setParams] = useSearchParams();

  const [resultado, setResultado] = useState({ livros: [], total: 0, pagina: 1, totalPaginas: 1 });
  const [carregando, setCarregando] = useState(true);
  const [primeiraCarga, setPrimeiraCarga] = useState(true);
  const [opcoes, setOpcoes] = useState({ autores: [], generos: [], tematicas: [], anos: [] });
  const [destaques, setDestaques] = useState([]);

  // A busca por texto espera o usuário parar de digitar
  const [buscaDigitada, setBuscaDigitada] = useState(params.get('busca') || '');
  const buscaAtrasada = useDebounce(buscaDigitada, 400);

  const filtros = Object.fromEntries(CAMPOS_FILTRO.map((c) => [c, params.get(c) || '']));
  const temFiltroAtivo = CAMPOS_FILTRO.some((c) => c !== 'ordem' && c !== 'pagina' && filtros[c]);
  const chaveFiltros = params.toString();

  function atualizarParametro(campo, valor) {
    setParams(
      (atual) => {
        const novo = new URLSearchParams(atual);
        if (valor) novo.set(campo, valor);
        else novo.delete(campo);
        if (campo !== 'pagina') novo.delete('pagina'); // mudou filtro -> volta à página 1
        return novo;
      },
      { replace: campo !== 'pagina' },
    );
  }

  function aoMudarFiltro(campo, valor) {
    if (campo === 'busca') setBuscaDigitada(valor);
    else atualizarParametro(campo, valor);
  }

  function limparFiltros() {
    setBuscaDigitada('');
    setParams(filtros.ordem ? { ordem: filtros.ordem } : {});
  }

  // Busca digitada -> URL
  useEffect(() => {
    if (buscaAtrasada !== (params.get('busca') || '')) atualizarParametro('busca', buscaAtrasada.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaAtrasada]);

  // Carrega opções dos filtros e destaques uma vez
  useEffect(() => {
    livrosApi.opcoesFiltro().then(setOpcoes).catch(() => {});
    livrosApi
      .destaques(6)
      .then((r) => setDestaques(r.livros))
      .catch(() => {});
  }, []);

  // Sempre que os filtros da URL mudam, busca os livros
  const ultimaRequisicao = useRef(0);
  useEffect(() => {
    const id = ++ultimaRequisicao.current;
    setCarregando(true);
    const parametros = Object.fromEntries(new URLSearchParams(chaveFiltros));

    livrosApi
      .listar(parametros)
      .then((r) => id === ultimaRequisicao.current && setResultado(r))
      .catch((erro) => id === ultimaRequisicao.current && avisar(erro.message, 'erro'))
      .finally(() => {
        if (id === ultimaRequisicao.current) {
          setCarregando(false);
          setPrimeiraCarga(false);
        }
      });
  }, [chaveFiltros, avisar]);

  const mostrarDestaques = destaques.length > 0 && !temFiltroAtivo && !filtros.pagina;

  return (
    <>
      {/* --------- Boas-vindas --------- */}
      <section className="hero">
        <div className="container hero__conteudo">
          <div>
            <p className="hero__saudacao">{perfil ? `Olá, ${primeiroNome(perfil.nome)}!` : 'Bem-vindo(a)!'}</p>
            <h1>
              Descubra o que ler <em>nas entrelinhas</em> da nossa biblioteca
            </h1>
            <p className="hero__texto">
              Explore o acervo do SESI/SENAI, veja as notas dos colegas e guarde seus próximos livros na lista{' '}
              <strong>Quero Ler</strong>.
            </p>
            {!perfil && (
              <Link to="/cadastrar" className="botao botao--caramelo">
                Criar minha conta
              </Link>
            )}
          </div>
          <div className="hero__ilustracao" aria-hidden="true">
            <span className="hero__planta hero__planta--1" />
            <span className="hero__planta hero__planta--2" />
            <Avela tamanho={190} variante="leitor" decorativo />
          </div>
        </div>
      </section>

      <div className="container">
        {/* --------- RF30: Ranking de destaques --------- */}
        {mostrarDestaques && (
          <section className="destaques" aria-labelledby="titulo-destaques">
            <h2 id="titulo-destaques" className="titulo-secao">
              ⭐ Os queridinhos da turma
            </h2>
            <div className="trilho-livros">
              {destaques.map((livro, i) => (
                <CardLivro key={livro.id} livro={livro} posicao={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* --------- Acervo com filtros --------- */}
        <section aria-labelledby="titulo-acervo">
          <h2 id="titulo-acervo" className="titulo-secao">
            Acervo
          </h2>

          <Filtros
            filtros={{ ...filtros, buscaDigitada }}
            opcoes={opcoes}
            aoMudar={aoMudarFiltro}
            aoLimpar={limparFiltros}
            temFiltroAtivo={temFiltroAtivo}
          />

          {primeiraCarga ? (
            <TelaCarregamento telaCheia={false} />
          ) : resultado.livros.length === 0 ? (
            // RF22 — estado vazio personalizado
            <EstadoVazio
              titulo="Hmm… o Avelã não encontrou nenhum livro"
              mensagem="Tente outra palavra ou tire alguns filtros para ampliar a busca."
            >
              {temFiltroAtivo && (
                <button type="button" className="botao botao--primario" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              )}
            </EstadoVazio>
          ) : (
            <>
              <p className="texto-suave resultado-contagem" aria-live="polite">
                {plural(resultado.total, 'livro encontrado', 'livros encontrados')}
              </p>
              <div className={`grade-livros ${carregando ? 'grade-livros--atualizando' : ''}`}>
                {resultado.livros.map((livro) => (
                  <CardLivro key={livro.id} livro={livro} />
                ))}
              </div>
              <Paginacao
                pagina={resultado.pagina}
                totalPaginas={resultado.totalPaginas}
                aoMudar={(p) => {
                  atualizarParametro('pagina', p > 1 ? String(p) : '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </section>
      </div>
    </>
  );
}
