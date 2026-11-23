// =====================================================================
// PAINEL DA BIBLIOTECA (bibliotecária e admin) — RF05
// Aba "Acervo": listagem com busca, status, editar e excluir (RF08–RF11)
// Aba "Moderação": todas as resenhas recentes (RF28)
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { livrosApi, resenhasApi } from '../../services/api.js';
import { STATUS } from '../../utils/constantes.js';
import { formatarData } from '../../utils/formatar.js';
import Avela from '../../components/avela/Avela.jsx';
import EstadoVazio from '../../components/avela/EstadoVazio.jsx';
import { Estrelas } from '../../components/livros/Estrelas.jsx';
import { SeloClassificacao } from '../../components/livros/Selos.jsx';
import ModalConfirmar from '../../components/ui/ModalConfirmar.jsx';
import Paginacao from '../../components/ui/Paginacao.jsx';

// ---------------------------------------------------------------------
// Números do topo
// ---------------------------------------------------------------------
function Resumo({ atualizar }) {
  const [numeros, setNumeros] = useState(null);

  useEffect(() => {
    const contar = (filtro) => livrosApi.listar({ ...filtro, porPagina: 1 }).then((r) => r.total);
    Promise.all([contar({}), ...STATUS.map((s) => contar({ status: s.valor }))])
      .then(([total, ...porStatus]) => setNumeros({ total, porStatus }))
      .catch(() => setNumeros(null));
  }, [atualizar]);

  if (!numeros) return null;
  return (
    <div className="resumo">
      <div className="resumo__item">
        <strong>{numeros.total}</strong>
        <span>livros no acervo</span>
      </div>
      {STATUS.map((s, i) => (
        <div key={s.valor} className={`resumo__item resumo__item--${s.valor}`}>
          <strong>{numeros.porStatus[i]}</strong>
          <span>{s.rotulo.toLowerCase()}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------
// Aba Acervo
// ---------------------------------------------------------------------
function AbaAcervo() {
  const { avisar } = useToast();
  const [busca, setBusca] = useState('');
  const buscaAtrasada = useDebounce(busca);
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [versao, setVersao] = useState(0); // muda para recarregar o resumo

  const carregar = useCallback(async () => {
    try {
      setDados(await livrosApi.listar({ busca: buscaAtrasada, pagina, porPagina: 20, ordem: 'recentes' }));
    } catch (e) {
      avisar(e.message, 'erro');
    }
  }, [buscaAtrasada, pagina, avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => setPagina(1), [buscaAtrasada]);

  async function mudarStatus(livro, status) {
    try {
      const r = await livrosApi.alterarStatus(livro.id, status);
      setDados((d) => ({
        ...d,
        livros: d.livros.map((l) => (l.id === livro.id ? { ...l, status_disponibilidade: status } : l)),
      }));
      setVersao((v) => v + 1);
      avisar(r.mensagem);
    } catch (e) {
      avisar(e.message, 'erro');
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const r = await livrosApi.excluir(paraExcluir.id);
      avisar(r.mensagem);
      setParaExcluir(null);
      setVersao((v) => v + 1);
      carregar();
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <>
      <Resumo atualizar={versao} />

      <div className="barra-ferramentas">
        <input
          type="search"
          className="entrada-busca"
          placeholder="Buscar por título, autor ou descrição…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar no acervo"
        />
        <Link to="/painel/livros/novo" className="botao botao--primario">
          + Cadastrar livro
        </Link>
      </div>

      {!dados ? (
        <p className="texto-suave">Carregando…</p>
      ) : dados.livros.length === 0 ? (
        <EstadoVazio titulo="Nenhum livro encontrado" mensagem={busca ? 'Tente outra busca.' : 'Cadastre o primeiro livro do acervo!'} />
      ) : (
        <>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título / Autor</th>
                  <th>Gênero</th>
                  <th>Idade</th>
                  <th>Nota</th>
                  <th>Situação</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {dados.livros.map((livro) => (
                  <tr key={livro.id}>
                    <td className="tabela__codigo">{livro.codigo_acervo}</td>
                    <td>
                      <Link to={`/livros/${livro.id}`} className="tabela__titulo">
                        {livro.titulo}
                      </Link>
                      <small>{livro.autor}</small>
                    </td>
                    <td>{livro.genero}</td>
                    <td>
                      <SeloClassificacao valor={livro.classificacao_etaria} />
                    </td>
                    <td>
                      <Estrelas valor={livro.media_estrelas} tamanho={13} />
                      <small> ({livro.total_avaliacoes})</small>
                    </td>
                    <td>
                      <select
                        className={`select-status select-status--${livro.status_disponibilidade}`}
                        value={livro.status_disponibilidade}
                        onChange={(e) => mudarStatus(livro, e.target.value)}
                        aria-label={`Situação de ${livro.titulo}`}
                      >
                        {STATUS.map((s) => (
                          <option key={s.valor} value={s.valor}>
                            {s.rotulo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="tabela__acoes">
                      <Link to={`/painel/livros/${livro.id}/editar`} className="botao botao--fantasma botao--p">
                        Editar
                      </Link>
                      <button type="button" className="botao botao--perigo-suave botao--p" onClick={() => setParaExcluir(livro)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} aoMudar={setPagina} />
        </>
      )}

      <ModalConfirmar
        aberto={Boolean(paraExcluir)}
        titulo={`Excluir “${paraExcluir?.titulo}”?`}
        mensagem="O livro sai do acervo junto com todas as avaliações, resenhas e favoritos dele. Não dá para desfazer."
        textoConfirmar="Sim, excluir"
        perigo
        processando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------
// Aba Moderação
// ---------------------------------------------------------------------
function AbaModeracao() {
  const { avisar } = useToast();
  const [pagina, setPagina] = useState(1);
  const [dados, setDados] = useState(null);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setDados(await resenhasApi.moderacao(pagina));
    } catch (e) {
      avisar(e.message, 'erro');
    }
  }, [pagina, avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const r = await resenhasApi.excluir(paraExcluir.id);
      avisar(r.mensagem);
      setParaExcluir(null);
      carregar();
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  if (!dados) return <p className="texto-suave">Carregando…</p>;
  if (dados.resenhas.length === 0) {
    return <EstadoVazio titulo="Nenhuma resenha ainda" mensagem="Quando os estudantes escreverem, elas aparecem aqui." expressao="feliz" />;
  }

  return (
    <>
      <p className="texto-suave">Resenhas mais recentes primeiro. Exclua as que tiverem conteúdo inadequado ou ofensivo.</p>
      <ul className="lista-resenhas">
        {dados.resenhas.map((r) => (
          <li key={r.id} className="resenha">
            <div className="resenha__cabeca">
              <span className="avatar-redondo">
                <Avela tamanho={36} variante={r.autor?.avatar_avela} somenteRosto decorativo />
              </span>
              <div>
                <strong>{r.autor?.nome}</strong> em{' '}
                <Link to={`/livros/${r.livro_id}`}>{r.livros?.titulo || 'livro'}</Link>
                <div className="resenha__meta">{formatarData(r.created_at)}</div>
              </div>
            </div>
            <p className="resenha__texto">{r.texto}</p>
            <div className="resenha__acoes">
              <button type="button" className="botao-link botao-link--perigo" onClick={() => setParaExcluir(r)}>
                Excluir resenha
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} aoMudar={setPagina} />

      <ModalConfirmar
        aberto={Boolean(paraExcluir)}
        titulo="Excluir esta resenha?"
        mensagem={`Resenha de ${paraExcluir?.autor?.nome}. Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        perigo
        processando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------
export default function PainelBiblioteca() {
  const [aba, setAba] = useState('acervo');

  return (
    <div className="container painel">
      <header className="painel__cabeca">
        <Avela tamanho={70} variante="leitor" decorativo />
        <div>
          <h1>Painel da Biblioteca</h1>
          <p className="texto-suave">Catalogação, disponibilidade e moderação.</p>
        </div>
      </header>

      <div className="abas" role="tablist">
        <button type="button" role="tab" aria-selected={aba === 'acervo'} className={`aba ${aba === 'acervo' ? 'ativa' : ''}`} onClick={() => setAba('acervo')}>
          Acervo
        </button>
        <button type="button" role="tab" aria-selected={aba === 'moderacao'} className={`aba ${aba === 'moderacao' ? 'ativa' : ''}`} onClick={() => setAba('moderacao')}>
          Moderação de resenhas
        </button>
      </div>

      {aba === 'acervo' ? <AbaAcervo /> : <AbaModeracao />}
    </div>
  );
}
