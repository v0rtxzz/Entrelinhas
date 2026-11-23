// =====================================================================
// LOGIN E PERFIL DO USUÁRIO — RF01, RF02, RF03
// ---------------------------------------------------------------------
// Guarda quem está logado e o perfil dele (nome, cargo, avatar...).
// Uso em qualquer componente:
//   const { perfil, ehEquipe, ehAdmin, entrar, sair } = useAuth();
//
// O login em si é feito pelo Supabase Auth (senha criptografada,
// sessão segura — RNF06). O perfil vem do nosso back-end (/api/perfil).
// =====================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase.js';
import { perfilApi } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

// Traduz mensagens comuns do Supabase Auth para português
function traduzirErroAuth(erro) {
  const msg = erro?.message || '';
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(msg)) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).';
  if (/already registered|already been registered/i.test(msg)) return 'Este e-mail já tem cadastro. Tente entrar.';
  if (/password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit|too many/i.test(msg)) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (/same as the old|different from the old/i.test(msg)) return 'A nova senha precisa ser diferente da anterior.';
  return 'Não foi possível concluir. Tente novamente.';
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { avisar } = useToast();

  const [sessao, setSessao] = useState(null);
  const [iniciado, setIniciado] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [perfilCarregadoId, setPerfilCarregadoId] = useState(null);

  // 1) Escuta login/logout/renovação de sessão do Supabase
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((evento, novaSessao) => {
      setSessao(novaSessao);
      setIniciado(true);
      if (evento === 'PASSWORD_RECOVERY') navigate('/nova-senha');
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  // 2) Sempre que o usuário logado muda, busca o perfil dele na API
  const usuarioId = sessao?.user?.id ?? null;

  const carregarPerfil = useCallback(async () => {
    if (!usuarioId) return;
    try {
      const { perfil: dados } = await perfilApi.meu();
      setPerfil(dados);
    } catch (erro) {
      setPerfil(null);
      if (erro.status === 401 || erro.status === 403) {
        avisar(erro.message, 'erro'); // ex.: conta desativada
        await supabase.auth.signOut();
      }
    } finally {
      setPerfilCarregadoId(usuarioId);
    }
  }, [usuarioId, avisar]);

  useEffect(() => {
    if (usuarioId) carregarPerfil();
    else setPerfil(null);
  }, [usuarioId, carregarPerfil]);

  // ---------------- Ações ----------------
  const entrar = useCallback(async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(traduzirErroAuth(error));
  }, []);

  // RF01 — nome e turma vão em "data" e o gatilho do banco cria o perfil
  const cadastrar = useCallback(async ({ nome, email, senha, turma_unidade }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, turma_unidade },
        emailRedirectTo: `${window.location.origin}/entrar`,
      },
    });
    if (error) throw new Error(traduzirErroAuth(error));
    // Se a confirmação de e-mail estiver ligada no Supabase, não há sessão ainda
    return { precisaConfirmarEmail: !data.session };
  }, []);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    navigate('/');
  }, [navigate]);

  // RF03 — envia e-mail com link para criar nova senha
  const recuperarSenha = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nova-senha`,
    });
    if (error) throw new Error(traduzirErroAuth(error));
  }, []);

  const definirNovaSenha = useCallback(async (senha) => {
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) throw new Error(traduzirErroAuth(error));
  }, []);

  const valor = useMemo(() => {
    const carregando = !iniciado || (Boolean(usuarioId) && perfilCarregadoId !== usuarioId);
    return {
      sessao,
      perfil,
      logado: Boolean(sessao && perfil),
      ehEquipe: ['bibliotecaria', 'admin'].includes(perfil?.cargo),
      ehAdmin: perfil?.cargo === 'admin',
      carregando,
      entrar,
      cadastrar,
      sair,
      recuperarSenha,
      definirNovaSenha,
      setPerfil, // usado pela página de perfil depois de salvar
      recarregarPerfil: carregarPerfil,
    };
  }, [sessao, perfil, iniciado, usuarioId, perfilCarregadoId, entrar, cadastrar, sair, recuperarSenha, definirNovaSenha, carregarPerfil]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return contexto;
}
