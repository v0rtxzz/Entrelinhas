// =====================================================================
// MURAL DE RESENHAS DO LIVRO — RF25, RF26, RF27, RF28
// ---------------------------------------------------------------------
// * Qualquer pessoa lê; logado escreve
// * Autor edita/apaga a própria; equipe pode moderar qualquer uma
// * Ordenação: mais recentes ou maiores notas
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { resenhasApi } from '../../services/api.js';
import { formatarData } from '../../utils/formatar.js';
import Avela from '../avela/Avela.jsx';
import EstadoVazio from '../avela/EstadoVazio.jsx';
import { Estrelas, SeletorEstrelas } from '../livros/Estrelas.jsx';
import ModalConfirmar from '../ui/ModalConfirmar.jsx';

const LIMITE_TEXTO = 2000;

function ItemResenha({ resenha, ehMinha, podeModerar, aoEditar, aoExcluir }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(resenha.texto);
  const [salvando, setSalvando] = useState(false);
  const foiEditada = resenha.updated_at && resenha.updated_at !== resenha.created_at;

  async function salvar() {
    setSalvando(true);
    const ok = await aoEditar(resenha.id, texto);
    setSalvando(false);
    if (ok) setEditando(false);
  }

  return (
    <li className={`resenha ${ehMinha ? 'resenha--minha' : ''}`}>
      <div className="resenha__cabeca">
        <span className="avatar-redondo">
          <Avela tamanho={40} variante={resenha.autor?.avatar_avela} somenteRosto decorativo />
        </span>
        <div>
          <strong>{resenha.autor?.nome}</strong>
          {resenha.autor?.cargo === 'bibliotecaria' && <span className="etiqueta">Bibliotecária</span>}
          {ehMinha && <span className="etiqueta etiqueta--verde">Você</span>}
          <div className="resenha__meta">
            {resenha.nota ? <Estrelas valor={resenha.nota} tamanho={14} /> : <span>Sem nota</span>}
            <span>
              · {formatarData(resenha.created_at)}
              {foiEditada && ' (editada)'}
            </span>
          </div>
        </div>
      </div>

      {editando ? (
        <div className="resenha__edicao">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={4}
            aria-label="Editar resenha"
          />
          <div className="resenha__acoes">
            <button type="button" className="botao botao--fantasma botao--p" onClick={() => setEditando(false)}>
              Cancelar
            </button>
            <button type="button" className="botao botao--primario botao--p" onClick={salvar} disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      ) : (
        <p className="resenha__texto">{resenha.texto}</p>
      )}

      {!editando && (ehMinha || podeModerar) && (
        <div className="resenha__acoes">
          {ehMinha && (
            <button type="button" className="botao-link" onClick={() => setEditando(true)}>
              Editar
            </button>
          )}
          <button type="button" className="botao-link botao-link--perigo" onClick={() => aoExcluir(resenha)}>
            {ehMinha ? 'Excluir' : 'Moderar (excluir)'}
          </button>
        </div>
      )}
    </li>
  );
}

export default function SecaoResenhas({ livroId, minhaNota, aoAvaliar }) {
  const { logado, perfil, ehEquipe } = useAuth();
  const { avisar } = useToast();

  const [resenhas, setResenhas] = useState([]);
  const [ordem, setOrdem] = useState('recentes');
  const [carregando, setCarregando] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [paraExcluir, setParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { resenhas: lista } = await resenhasApi.doLivro(livroId, ordem);
      setResenhas(lista);
    } catch (erro) {
      avisar(erro.message, 'erro');
    } finally {
      setCarregando(false);
    }
  }, [livroId, ordem, avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Quando a nota muda lá em cima, atualiza as resenhas do próprio usuário
  useEffect(() => {
    if (!perfil) return;
    setResenhas((lista) => lista.map((r) => (r.usuario_id === perfil.id ? { ...r, nota: minhaNota } : r)));
  }, [minhaNota, perfil]);

  async function publicar(evento) {
    evento.preventDefault();
    if (texto.trim().length < 3) {
      avisar('Escreva pelo menos 3 caracteres na resenha.', 'erro');
      return;
    }
    setEnviando(true);
    try {
      const { resenha, mensagem } = await resenhasApi.criar(livroId, texto, minhaNota);
      setResenhas((lista) => [resenha, ...lista]);
      setTexto('');
      avisar(mensagem);
    } catch (erro) {
      avisar(erro.detalhes?.texto || erro.message, 'erro');
    } finally {
      setEnviando(false);
    }
  }

  async function editar(id, novoTexto) {
    try {
      const { resenha, mensagem } = await resenhasApi.editar(id, novoTexto);
      setResenhas((lista) => lista.map((r) => (r.id === id ? { ...r, ...resenha } : r)));
      avisar(mensagem);
      return true;
    } catch (erro) {
      avisar(erro.detalhes?.texto || erro.message, 'erro');
      return false;
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      const { mensagem } = await resenhasApi.excluir(paraExcluir.id);
      setResenhas((lista) => lista.filter((r) => r.id !== paraExcluir.id));
      avisar(mensagem);
      setParaExcluir(null);
    } catch (erro) {
      avisar(erro.message, 'erro');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section className="secao-resenhas" aria-labelledby="titulo-resenhas">
      <div className="secao-resenhas__topo">
        <h2 id="titulo-resenhas">Resenhas da comunidade</h2>
        <label className="campo-inline">
          <span>Ordenar por</span>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
            <option value="recentes">Mais recentes</option>
            <option value="notas">Maiores notas</option>
          </select>
        </label>
      </div>

      {logado ? (
        <form className="form-resenha cartao" onSubmit={publicar}>
          <div className="form-resenha__nota">
            <span>Sua nota:</span>
            <SeletorEstrelas valor={minhaNota} aoMudar={aoAvaliar} tamanho={26} />
          </div>
          <label htmlFor="nova-resenha" className="sr-only">
            Sua resenha
          </label>
          <textarea
            id="nova-resenha"
            placeholder="O que você achou deste livro? Conte sem dar spoilers 😉"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={4}
          />
          <div className="form-resenha__rodape">
            <small>
              {texto.length}/{LIMITE_TEXTO}
            </small>
            <button type="submit" className="botao botao--primario" disabled={enviando}>
              {enviando ? 'Publicando…' : 'Publicar resenha'}
            </button>
          </div>
        </form>
      ) : (
        <p className="cartao cartao--convite">
          <Link to="/entrar">Entre</Link> ou <Link to="/cadastrar">crie sua conta</Link> para avaliar e escrever
          resenhas.
        </p>
      )}

      {carregando ? (
        <p className="texto-suave">Carregando resenhas…</p>
      ) : resenhas.length === 0 ? (
        <EstadoVazio
          titulo="Ainda não há resenhas"
          mensagem="Seja a primeira pessoa a contar o que achou deste livro!"
          expressao="feliz"
          variante="cachecol"
        />
      ) : (
        <ul className="lista-resenhas">
          {resenhas.map((r) => (
            <ItemResenha
              key={r.id}
              resenha={r}
              ehMinha={perfil?.id === r.usuario_id}
              podeModerar={ehEquipe}
              aoEditar={editar}
              aoExcluir={setParaExcluir}
            />
          ))}
        </ul>
      )}

      <ModalConfirmar
        aberto={Boolean(paraExcluir)}
        titulo="Excluir esta resenha?"
        mensagem={
          paraExcluir && perfil?.id !== paraExcluir.usuario_id
            ? `Você está moderando a resenha de ${paraExcluir.autor?.nome}. Essa ação não pode ser desfeita.`
            : 'Essa ação não pode ser desfeita.'
        }
        textoConfirmar="Excluir"
        perigo
        processando={excluindo}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setParaExcluir(null)}
      />
    </section>
  );
}
