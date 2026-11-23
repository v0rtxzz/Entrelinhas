// =====================================================================
// CADASTRAR / EDITAR LIVRO — RF07, RF08, RF10 (+ capa: RNF12)
// Mesma tela para os dois casos: /painel/livros/novo  e  /painel/livros/:id/editar
// =====================================================================
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext.jsx';
import { livrosApi } from '../../services/api.js';
import { enviarCapa } from '../../services/capas.js';
import { CLASSIFICACOES, GENEROS_SUGERIDOS, STATUS, TEMATICAS_SUGERIDAS } from '../../utils/constantes.js';
import TelaCarregamento from '../../components/avela/TelaCarregamento.jsx';
import CapaLivro from '../../components/livros/CapaLivro.jsx';
import Campo from '../../components/ui/Campo.jsx';

const LIVRO_VAZIO = {
  codigo_acervo: '',
  titulo: '',
  autor: '',
  genero: '',
  tematica: '',
  classificacao_etaria: 'L',
  status_disponibilidade: 'disponivel',
  ano_publicacao: '',
  descricao: '',
  sinopse: '',
  capa_url: '',
};

// Validação rápida no navegador (o back-end valida de novo — RNF09)
function validar(livro) {
  const erros = {};
  if (!livro.codigo_acervo.trim()) erros.codigo_acervo = 'Informe o código do acervo.';
  if (!livro.titulo.trim()) erros.titulo = 'Informe o título.';
  if (!livro.autor.trim()) erros.autor = 'Informe o autor.';
  if (!livro.genero.trim()) erros.genero = 'Informe o gênero.';
  const ano = Number(livro.ano_publicacao);
  if (livro.ano_publicacao && (!Number.isInteger(ano) || ano < 1000 || ano > new Date().getFullYear() + 1)) {
    erros.ano_publicacao = 'Ano inválido.';
  }
  return erros;
}

export default function FormLivro() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();
  const { avisar } = useToast();

  const [livro, setLivro] = useState(LIVRO_VAZIO);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);

  useEffect(() => {
    if (!editando) return;
    livrosApi
      .buscar(id)
      .then(({ livro: dados }) => {
        // null vira '' para os inputs controlados
        setLivro(Object.fromEntries(Object.keys(LIVRO_VAZIO).map((k) => [k, dados[k] ?? ''])));
      })
      .catch((e) => {
        avisar(e.message, 'erro');
        navigate('/painel');
      })
      .finally(() => setCarregando(false));
  }, [editando, id, avisar, navigate]);

  const mudar = (campo) => (e) => setLivro((l) => ({ ...l, [campo]: e.target.value }));

  async function aoEscolherCapa(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    setEnviandoCapa(true);
    try {
      const url = await enviarCapa(arquivo);
      setLivro((l) => ({ ...l, capa_url: url }));
      avisar('Capa enviada!');
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setEnviandoCapa(false);
      evento.target.value = '';
    }
  }

  async function salvar(evento) {
    evento.preventDefault();
    const novosErros = validar(livro);
    setErros(novosErros);
    if (Object.keys(novosErros).length) {
      avisar('Confira os campos destacados.', 'erro');
      return;
    }

    setSalvando(true);
    try {
      const dados = { ...livro, ano_publicacao: livro.ano_publicacao === '' ? null : Number(livro.ano_publicacao) };
      const r = editando ? await livrosApi.atualizar(id, dados) : await livrosApi.criar(dados);
      avisar(r.mensagem);
      navigate(`/livros/${r.livro.id}`);
    } catch (e) {
      setErros(e.detalhes || {});
      avisar(e.message, 'erro');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <TelaCarregamento telaCheia={false} />;

  return (
    <div className="container painel">
      <Link to="/painel" className="voltar">
        ← Voltar ao painel
      </Link>
      <h1>{editando ? 'Editar livro' : 'Cadastrar novo livro'}</h1>

      <form className="form-livro" onSubmit={salvar} noValidate>
        <div className="form-livro__campos cartao formulario">
          <div className="grade-2">
            <Campo rotulo="Código do acervo" dica="Ex.: ENT-0013 (único)" erro={erros.codigo_acervo} obrigatorio>
              <input value={livro.codigo_acervo} onChange={mudar('codigo_acervo')} maxLength={30} />
            </Campo>
            <Campo rotulo="Ano de publicação" erro={erros.ano_publicacao}>
              <input type="number" inputMode="numeric" value={livro.ano_publicacao} onChange={mudar('ano_publicacao')} />
            </Campo>
          </div>

          <Campo rotulo="Título" erro={erros.titulo} obrigatorio>
            <input value={livro.titulo} onChange={mudar('titulo')} maxLength={200} />
          </Campo>
          <Campo rotulo="Autor(a)" erro={erros.autor} obrigatorio>
            <input value={livro.autor} onChange={mudar('autor')} maxLength={150} />
          </Campo>

          <div className="grade-2">
            <Campo rotulo="Gênero" dica="Escolha da lista ou digite" erro={erros.genero} obrigatorio>
              <input list="lista-generos" value={livro.genero} onChange={mudar('genero')} maxLength={60} />
            </Campo>
            <Campo rotulo="Temática" dica="Escolha da lista ou digite" erro={erros.tematica}>
              <input list="lista-tematicas" value={livro.tematica} onChange={mudar('tematica')} maxLength={60} />
            </Campo>
          </div>
          <datalist id="lista-generos">
            {GENEROS_SUGERIDOS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
          <datalist id="lista-tematicas">
            {TEMATICAS_SUGERIDAS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>

          <div className="grade-2">
            <Campo rotulo="Classificação etária" erro={erros.classificacao_etaria} obrigatorio>
              <select value={livro.classificacao_etaria} onChange={mudar('classificacao_etaria')}>
                {CLASSIFICACOES.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.rotulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Situação do exemplar" erro={erros.status_disponibilidade} obrigatorio>
              <select value={livro.status_disponibilidade} onChange={mudar('status_disponibilidade')}>
                {STATUS.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.rotulo}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo rotulo="Descrição curta" dica="Uma frase que aparece no card (até 500 caracteres)" erro={erros.descricao}>
            <textarea rows={2} value={livro.descricao} onChange={mudar('descricao')} maxLength={500} />
          </Campo>
          <Campo rotulo="Sinopse completa" erro={erros.sinopse}>
            <textarea rows={6} value={livro.sinopse} onChange={mudar('sinopse')} maxLength={5000} />
          </Campo>
        </div>

        <aside className="form-livro__capa cartao">
          <h2 className="titulo-pequeno">Capa</h2>
          <CapaLivro livro={{ ...livro, titulo: livro.titulo || 'Título do livro', autor: livro.autor || 'Autor' }} tamanho="grande" />

          <label className="botao botao--fantasma botao--bloco entrada-arquivo">
            {enviandoCapa ? 'Enviando…' : 'Enviar imagem (até 2 MB)'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={aoEscolherCapa} disabled={enviandoCapa} />
          </label>

          <Campo rotulo="…ou cole o link da imagem" erro={erros.capa_url} dica="Precisa começar com https://">
            <input type="url" value={livro.capa_url} onChange={mudar('capa_url')} placeholder="https://" />
          </Campo>
          {livro.capa_url && (
            <button type="button" className="botao-link botao-link--perigo" onClick={() => setLivro((l) => ({ ...l, capa_url: '' }))}>
              Remover capa
            </button>
          )}
        </aside>

        <div className="form-livro__acoes">
          <Link to="/painel" className="botao botao--fantasma">
            Cancelar
          </Link>
          <button type="submit" className="botao botao--primario" disabled={salvando || enviandoCapa}>
            {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar livro'}
          </button>
        </div>
      </form>
    </div>
  );
}
