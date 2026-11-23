// CRIAR CONTA — RF01 (todo cadastro nasce com o perfil "Usuário")
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import Campo from '../../components/ui/Campo.jsx';
import CartaoAuth from './CartaoAuth.jsx';

function validar({ nome, email, senha, confirmarSenha }) {
  const erros = {};
  if (nome.trim().length < 2) erros.nome = 'Informe seu nome completo.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) erros.email = 'Informe um e-mail válido.';
  if (senha.length < 6) erros.senha = 'A senha precisa ter pelo menos 6 caracteres.';
  if (senha !== confirmarSenha) erros.confirmarSenha = 'As senhas não são iguais.';
  return erros;
}

export default function Cadastrar() {
  const { cadastrar, logado } = useAuth();
  const { avisar } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nome: '', email: '', turma_unidade: '', senha: '', confirmarSenha: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aguardandoEmail, setAguardandoEmail] = useState(false);

  useEffect(() => {
    if (logado) navigate('/', { replace: true });
  }, [logado, navigate]);

  const mudar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const novosErros = validar(form);
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    try {
      const { precisaConfirmarEmail } = await cadastrar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        turma_unidade: form.turma_unidade.trim(),
      });
      if (precisaConfirmarEmail) setAguardandoEmail(true);
      else avisar('Conta criada! Boas leituras 🐾');
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (aguardandoEmail) {
    return (
      <CartaoAuth titulo="Confira seu e-mail" subtitulo="Falta só um passinho!" variante="cachecol">
        <p className="texto-centro">
          Enviamos um link de confirmação para <strong>{form.email}</strong>. Clique nele e depois volte aqui para
          entrar.
        </p>
        <Link to="/entrar" className="botao botao--primario botao--bloco">
          Ir para o login
        </Link>
      </CartaoAuth>
    );
  }

  return (
    <CartaoAuth titulo="Criar conta" subtitulo="Para estudantes do SESI e do SENAI." variante="formatura">
      <form onSubmit={enviar} className="formulario" noValidate>
        {erroGeral && (
          <p className="alerta alerta--erro" role="alert">
            {erroGeral}
          </p>
        )}
        <Campo rotulo="Nome completo" erro={erros.nome} obrigatorio>
          <input autoComplete="name" value={form.nome} onChange={mudar('nome')} maxLength={120} />
        </Campo>
        <Campo rotulo="E-mail" erro={erros.email} obrigatorio>
          <input type="email" autoComplete="email" value={form.email} onChange={mudar('email')} />
        </Campo>
        <Campo rotulo="Unidade / Turma" dica="Ex.: SESI 2º A, SENAI Técnico em Informática" erro={erros.turma_unidade}>
          <input value={form.turma_unidade} onChange={mudar('turma_unidade')} maxLength={120} />
        </Campo>
        <Campo rotulo="Senha" dica="Mínimo de 6 caracteres" erro={erros.senha} obrigatorio>
          <input type="password" autoComplete="new-password" value={form.senha} onChange={mudar('senha')} />
        </Campo>
        <Campo rotulo="Confirmar senha" erro={erros.confirmarSenha} obrigatorio>
          <input
            type="password"
            autoComplete="new-password"
            value={form.confirmarSenha}
            onChange={mudar('confirmarSenha')}
          />
        </Campo>
        <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
      <div className="cartao-auth__links">
        <span>
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </span>
      </div>
    </CartaoAuth>
  );
}
