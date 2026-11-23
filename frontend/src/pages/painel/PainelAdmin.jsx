// =====================================================================
// PAINEL ADMINISTRATIVO — RF06
// Ver todos os usuários, mudar cargo e ativar/desativar contas.
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { adminApi } from '../../services/api.js';
import { CARGOS } from '../../utils/constantes.js';
import { formatarData } from '../../utils/formatar.js';
import Avela from '../../components/avela/Avela.jsx';
import EstadoVazio from '../../components/avela/EstadoVazio.jsx';
import ModalConfirmar from '../../components/ui/ModalConfirmar.jsx';

export default function PainelAdmin() {
  const { perfil } = useAuth();
  const { avisar } = useToast();

  const [busca, setBusca] = useState('');
  const buscaAtrasada = useDebounce(busca);
  const [usuarios, setUsuarios] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null); // { usuario, dados, titulo, mensagem }
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const r = await adminApi.usuarios(buscaAtrasada);
      setUsuarios(r.usuarios);
    } catch (e) {
      avisar(e.message, 'erro');
    }
  }, [buscaAtrasada, avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function pedirMudancaCargo(usuario, cargo) {
    const rotulo = CARGOS.find((c) => c.valor === cargo)?.rotulo;
    setConfirmacao({
      usuario,
      dados: { cargo },
      titulo: `Mudar cargo de ${usuario.nome}?`,
      mensagem: `O novo cargo será “${rotulo}”.${cargo === 'admin' ? ' Administradores podem gerenciar todos os usuários.' : ''}`,
    });
  }

  function pedirMudancaAtivo(usuario) {
    setConfirmacao({
      usuario,
      dados: { ativo: !usuario.ativo },
      titulo: usuario.ativo ? `Desativar a conta de ${usuario.nome}?` : `Reativar a conta de ${usuario.nome}?`,
      mensagem: usuario.ativo
        ? 'A pessoa não vai conseguir entrar, avaliar nem escrever resenhas até ser reativada.'
        : 'A pessoa volta a ter acesso normal ao sistema.',
      perigo: usuario.ativo,
    });
  }

  async function confirmar() {
    setProcessando(true);
    try {
      const r = await adminApi.alterarUsuario(confirmacao.usuario.id, confirmacao.dados);
      setUsuarios((lista) => lista.map((u) => (u.id === r.usuario.id ? r.usuario : u)));
      avisar(r.mensagem);
      setConfirmacao(null);
    } catch (e) {
      avisar(e.message, 'erro');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="container painel">
      <header className="painel__cabeca">
        <Avela tamanho={70} variante="formatura" decorativo />
        <div>
          <h1>Painel Administrativo</h1>
          <p className="texto-suave">Gerencie contas e cargos (Estudante, Bibliotecária, Administrador).</p>
        </div>
      </header>

      <div className="barra-ferramentas">
        <input
          type="search"
          className="entrada-busca"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar usuários"
        />
      </div>

      {!usuarios ? (
        <p className="texto-suave">Carregando…</p>
      ) : usuarios.length === 0 ? (
        <EstadoVazio titulo="Nenhum usuário encontrado" />
      ) : (
        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Unidade / Turma</th>
                <th>Desde</th>
                <th>Cargo</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const souEu = u.id === perfil.id;
                return (
                  <tr key={u.id} className={u.ativo ? '' : 'tabela__linha--inativa'}>
                    <td>
                      <div className="tabela__usuario">
                        <span className="avatar-redondo">
                          <Avela tamanho={34} variante={u.avatar_avela} somenteRosto decorativo />
                        </span>
                        <div>
                          <strong>
                            {u.nome} {souEu && <span className="etiqueta etiqueta--verde">Você</span>}
                          </strong>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{u.turma_unidade || '—'}</td>
                    <td>{formatarData(u.created_at)}</td>
                    <td>
                      <select
                        value={u.cargo}
                        disabled={souEu}
                        onChange={(e) => pedirMudancaCargo(u, e.target.value)}
                        aria-label={`Cargo de ${u.nome}`}
                        title={souEu ? 'Você não pode mudar o próprio cargo' : undefined}
                      >
                        {CARGOS.map((c) => (
                          <option key={c.valor} value={c.valor}>
                            {c.rotulo}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`interruptor ${u.ativo ? 'ligado' : ''}`}
                        role="switch"
                        aria-checked={u.ativo}
                        disabled={souEu}
                        onClick={() => pedirMudancaAtivo(u)}
                      >
                        <span className="interruptor__bolinha" />
                        <span>{u.ativo ? 'Ativa' : 'Desativada'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalConfirmar
        aberto={Boolean(confirmacao)}
        titulo={confirmacao?.titulo}
        mensagem={confirmacao?.mensagem}
        perigo={confirmacao?.perigo}
        processando={processando}
        aoConfirmar={confirmar}
        aoCancelar={() => setConfirmacao(null)}
      />
    </div>
  );
}
