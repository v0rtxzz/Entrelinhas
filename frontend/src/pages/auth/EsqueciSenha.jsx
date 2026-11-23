// RECUPERAR SENHA — RF03 (passo 1: pedir o e-mail)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Campo from '../../components/ui/Campo.jsx';
import CartaoAuth from './CartaoAuth.jsx';

export default function EsqueciSenha() {
  const { recuperarSenha } = useAuth();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await recuperarSenha(email.trim());
      setEnviado(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <CartaoAuth titulo="Esqueci minha senha" subtitulo="Acontece com todo mundo!" variante="leitor">
      {enviado ? (
        <p className="alerta alerta--sucesso">
          Se existir uma conta com <strong>{email}</strong>, você vai receber um e-mail com o link para criar uma nova
          senha.
        </p>
      ) : (
        <form onSubmit={enviar} className="formulario" noValidate>
          {erro && (
            <p className="alerta alerta--erro" role="alert">
              {erro}
            </p>
          )}
          <Campo rotulo="E-mail da sua conta" obrigatorio>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Campo>
          <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando || !email}>
            {enviando ? 'Enviando…' : 'Enviar link'}
          </button>
        </form>
      )}
      <div className="cartao-auth__links">
        <Link to="/entrar">← Voltar para o login</Link>
      </div>
    </CartaoAuth>
  );
}
