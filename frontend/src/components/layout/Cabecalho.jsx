// Cabeçalho com menu que muda conforme o perfil (RF02)
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Avela from '../avela/Avela.jsx';
import Logo from '../avela/Logo.jsx';
import { primeiroNome } from '../../utils/formatar.js';

export default function Cabecalho() {
  const { logado, perfil, ehEquipe, ehAdmin, sair } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();

  // Fecha o menu do celular ao trocar de página
  useEffect(() => setMenuAberto(false), [pathname]);

  return (
    <header className="cabecalho">
      <div className="cabecalho__conteudo container">
        <Link to="/" className="cabecalho__marca" aria-label="Entrelinhas — página inicial">
          <Logo claro />
        </Link>

        <button
          type="button"
          className="cabecalho__hamburguer"
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto((v) => !v)}
        >
          <span className="sr-only">Abrir menu</span>
          <span aria-hidden="true">{menuAberto ? '✕' : '☰'}</span>
        </button>

        <nav id="menu-principal" className={`cabecalho__nav ${menuAberto ? 'aberto' : ''}`} aria-label="Principal">
          <NavLink to="/" end>
            Acervo
          </NavLink>

          {ehEquipe && <NavLink to="/painel">Painel da Biblioteca</NavLink>}
          {ehAdmin && <NavLink to="/admin">Painel Admin</NavLink>}

          {logado ? (
            <div className="cabecalho__usuario">
              <NavLink to="/perfil" className="cabecalho__perfil">
                <span className="avatar-redondo avatar-redondo--p">
                  <Avela tamanho={30} variante={perfil.avatar_avela} somenteRosto decorativo />
                </span>
                Olá, {primeiroNome(perfil.nome)}
              </NavLink>
              <button type="button" className="botao botao--fantasma-claro botao--p" onClick={sair}>
                Sair
              </button>
            </div>
          ) : (
            <div className="cabecalho__usuario">
              <NavLink to="/entrar">Entrar</NavLink>
              <Link to="/cadastrar" className="botao botao--caramelo botao--p">
                Criar conta
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
