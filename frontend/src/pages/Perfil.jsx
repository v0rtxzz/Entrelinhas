// =====================================================================
// ÁREA DE PERFIL DO USUÁRIO — RF04
// Editar dados, escolher avatar do Avelã, ver "Quero Ler" e resenhas.
// =====================================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { favoritosApi, perfilApi, resenhasApi } from '../services/api.js';
import { AVATARES, CARGOS, rotuloDe } from '../utils/constantes.js';
import { formatarData } from '../utils/formatar.js';
import Avela from '../components/avela/Avela.jsx';
import EstadoVazio from '../components/avela/EstadoVazio.jsx';
import CardLivro from '../components/livros/CardLivro.jsx';
import Campo from '../components/ui/Campo.jsx';
import ModalConfirmar from '../components/ui/ModalConfirmar.jsx';

const ABAS = [
  { id: 'quero-ler', rotulo: 'Quero Ler' },
  { id: 'resenhas', rotulo: 'Minhas resenhas' },
  { id: 'dados', rotulo: 'Meus dados' },
];

export default function Perfil() {
  const { perfil, setPerfil } = useAuth();
  const { avisar } = useToast();

  const [aba, setAba] = useState('quero-ler');
  const [favoritos, setFavoritos] = useState(null);
  const [resenhas, setResenhas] = useState(null);
  const [form, setForm] = useState({ nome: perfil.nome, turma_unidade: perfil.turma_unidade || '', avatar_avela: perfil.avatar_avela });
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [resenhaParaExcluir, setResenhaParaExcluir] = useState(null);

  useEffect(() => {
    favoritosApi
      .listar()
      .then((r) => setFavoritos(r.livros))
      .catch((e) => avisar(e.message, 'erro'));
    perfilApi
      .meu()
      .then((r) => setResenhas(r.resenhas))
      .catch((e) => avisar(e.message, 'erro'));
  }, [avisar]);

  async function salvar(evento) {
    evento.preventDefault();
    setErros({});
    setSalvando(true);
    try {
      const r = await perfilApi.atualizar(form);
      setPerfil(r.perfil);
      avisar(r.mensagem);
    } catch (e) {
      setErros(e.detalhes);
      avisar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  async function removerFavorito(livroId) {
    try {
      const r = await favoritosApi.remover(livroId);
      setFavoritos((lista) => lista.filter((l) => l.id !== livroId));
      avisar(r.mensagem);
    } catch (e) {
      avisar(e.message, 'erro');
    }
  }

  async function excluirResenha() {
    try {
      const r = await resenhasApi.excluir(resenhaParaExcluir.id);
      setResenhas((lista) => lista.filter((x) => x.id !== resenhaParaExcluir.id));
      avisar(r.mensagem);
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setResenhaParaExcluir(null);
    }
  }

  return (
    <div className="container perfil">
      <header className="perfil__cabeca cartao">
        <span className="avatar-redondo avatar-redondo--g">
          <Avela tamanho={96} variante={perfil.avatar_avela} somenteRosto decorativo />
        </span>
        <div>
          <h1>{perfil.nome}</h1>
          <p className="texto-suave">
            {perfil.email}
            {perfil.turma_unidade && ` · ${perfil.turma_unidade}`}
          </p>
          <span className="etiqueta">{rotuloDe(CARGOS, perfil.cargo)}</span>
        </div>
      </header>

      <div className="abas" role="tablist" aria-label="Seções do perfil">
        {ABAS.map((a) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            className={`aba ${aba === a.id ? 'ativa' : ''}`}
            onClick={() => setAba(a.id)}
          >
            {a.rotulo}
            {a.id === 'quero-ler' && favoritos && <span className="aba__contador">{favoritos.length}</span>}
            {a.id === 'resenhas' && resenhas && <span className="aba__contador">{resenhas.length}</span>}
          </button>
        ))}
      </div>

      {/* ---------- RF29: Quero Ler ---------- */}
      {aba === 'quero-ler' &&
        (favoritos === null ? (
          <p className="texto-suave">Carregando…</p>
        ) : favoritos.length === 0 ? (
          <EstadoVazio titulo="Sua lista está vazia" mensagem="Toque em “Quero Ler” na página de um livro para guardar aqui.">
            <Link to="/" className="botao botao--primario">
              Explorar o acervo
            </Link>
          </EstadoVazio>
        ) : (
          <div className="grade-livros">
            {favoritos.map((livro) => (
              <div key={livro.id} className="favorito">
                <CardLivro livro={livro} />
                <button type="button" className="botao-link botao-link--perigo" onClick={() => removerFavorito(livro.id)}>
                  Remover da lista
                </button>
              </div>
            ))}
          </div>
        ))}

      {/* ---------- Minhas resenhas ---------- */}
      {aba === 'resenhas' &&
        (resenhas === null ? (
          <p className="texto-suave">Carregando…</p>
        ) : resenhas.length === 0 ? (
          <EstadoVazio titulo="Você ainda não escreveu resenhas" mensagem="Que tal contar o que achou do último livro que leu?" variante="cachecol" expressao="feliz" />
        ) : (
          <ul className="lista-resenhas">
            {resenhas.map((r) => (
              <li key={r.id} className="resenha">
                <div className="resenha__cabeca">
                  <div>
                    <Link to={`/livros/${r.livros?.id}`}>
                      <strong>{r.livros?.titulo}</strong>
                    </Link>
                    <div className="resenha__meta">
                      {r.livros?.autor} · {formatarData(r.created_at)}
                    </div>
                  </div>
                </div>
                <p className="resenha__texto">{r.texto}</p>
                <div className="resenha__acoes">
                  <Link to={`/livros/${r.livros?.id}`} className="botao-link">
                    Ver / editar no livro
                  </Link>
                  <button type="button" className="botao-link botao-link--perigo" onClick={() => setResenhaParaExcluir(r)}>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {/* ---------- Meus dados + avatar ---------- */}
      {aba === 'dados' && (
        <form className="cartao formulario perfil__form" onSubmit={salvar} noValidate>
          <fieldset className="seletor-avatar">
            <legend>Escolha seu Avelã</legend>
            <div className="seletor-avatar__opcoes">
              {AVATARES.map((a) => (
                <label key={a.valor} className={`opcao-avatar ${form.avatar_avela === a.valor ? 'selecionado' : ''}`}>
                  <input
                    type="radio"
                    name="avatar"
                    value={a.valor}
                    checked={form.avatar_avela === a.valor}
                    onChange={() => setForm((f) => ({ ...f, avatar_avela: a.valor }))}
                  />
                  <Avela tamanho={64} variante={a.valor} somenteRosto decorativo />
                  <span>{a.rotulo}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Campo rotulo="Nome completo" erro={erros?.nome} obrigatorio>
            <input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} maxLength={120} />
          </Campo>
          <Campo rotulo="Unidade / Turma" erro={erros?.turma_unidade}>
            <input
              value={form.turma_unidade}
              onChange={(e) => setForm((f) => ({ ...f, turma_unidade: e.target.value }))}
              maxLength={120}
            />
          </Campo>
          <Campo rotulo="E-mail" dica="O e-mail não pode ser alterado por aqui.">
            <input value={perfil.email} disabled />
          </Campo>

          <button type="submit" className="botao botao--primario" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>
      )}

      <ModalConfirmar
        aberto={Boolean(resenhaParaExcluir)}
        titulo="Excluir sua resenha?"
        mensagem="Essa ação não pode ser desfeita."
        textoConfirmar="Excluir"
        perigo
        aoConfirmar={excluirResenha}
        aoCancelar={() => setResenhaParaExcluir(null)}
      />
    </div>
  );
}
