// RECUPERAR SENHA — RF03 (passo 2: o usuário chega aqui pelo link do e-mail)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import Campo from '../../components/ui/Campo.jsx';
import CartaoAuth from './CartaoAuth.jsx';

export default function NovaSenha() {
  const { sessao, definirNovaSenha } = useAuth();
  const { avisar } = useToast();
  const navigate = useNavigate();

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    if (senha !== confirmar) return setErro('As senhas não são iguais.');

    setEnviando(true);
    try {
      await definirNovaSenha(senha);
      avisar('Senha alterada com sucesso!');
      navigate('/');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // O link do e-mail cria uma sessão temporária. Sem ela, não dá para trocar.
  if (!sessao) {
    return (
      <CartaoAuth titulo="Link inválido ou expirado" variante="noturno">
        <p className="texto-centro">Peça um novo link de recuperação de senha.</p>
        <Link to="/esqueci-senha" className="botao botao--primario botao--bloco">
          Pedir novo link
        </Link>
      </CartaoAuth>
    );
  }

  return (
    <CartaoAuth titulo="Criar nova senha" variante="leitor">
      <form onSubmit={enviar} className="formulario" noValidate>
        {erro && (
          <p className="alerta alerta--erro" role="alert">
            {erro}
          </p>
        )}
        <Campo rotulo="Nova senha" dica="Mínimo de 6 caracteres" obrigatorio>
          <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </Campo>
        <Campo rotulo="Confirmar nova senha" obrigatorio>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
        </Campo>
        <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </form>
    </CartaoAuth>
  );
}
