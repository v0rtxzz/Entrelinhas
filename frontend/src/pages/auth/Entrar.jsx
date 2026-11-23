// LOGIN — RF02
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import Campo from '../../components/ui/Campo.jsx';
import CartaoAuth from './CartaoAuth.jsx';

export default function Entrar() {
  const { entrar, logado } = useAuth();
  const { avisar } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const voltarPara = location.state?.voltarPara || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Quando o login termina (perfil carregado), vai para onde estava
  useEffect(() => {
    if (logado) navigate(voltarPara, { replace: true });
  }, [logado, navigate, voltarPara]);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      avisar('Que bom te ver por aqui! 📚');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <CartaoAuth titulo="Entrar" subtitulo="Use o e-mail cadastrado na biblioteca.">
      <form onSubmit={enviar} className="formulario" noValidate>
        {erro && (
          <p className="alerta alerta--erro" role="alert">
            {erro}
          </p>
        )}
        <Campo rotulo="E-mail" obrigatorio>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo rotulo="Senha" obrigatorio>
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Campo>
        <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <div className="cartao-auth__links">
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
        <span>
          Não tem conta? <Link to="/cadastrar">Criar conta</Link>
        </span>
      </div>
    </CartaoAuth>
  );
}
