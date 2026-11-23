// =====================================================================
// PROTEÇÃO DE ROTAS NO FRONT-END — RNF08
// <RotaProtegida>                         -> só logados
// <RotaProtegida cargos={['admin']}>       -> só admin
// Visitante vai para /entrar; quem não tem cargo volta para o início.
// (A segurança DE VERDADE está no back-end e na RLS do banco; aqui é
//  para a experiência do usuário.)
// =====================================================================
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useToast } from '../../contexts/ToastContext.jsx';
import TelaCarregamento from '../avela/TelaCarregamento.jsx';

function SemPermissao() {
  const { avisar } = useToast();
  useEffect(() => avisar('Você não tem permissão para acessar essa área.', 'erro'), [avisar]);
  return <Navigate to="/" replace />;
}

export default function RotaProtegida({ cargos, children }) {
  const { carregando, logado, perfil } = useAuth();
  const location = useLocation();

  if (carregando) return <TelaCarregamento telaCheia={false} />;

  if (!logado) {
    return <Navigate to="/entrar" replace state={{ voltarPara: location.pathname }} />;
  }

  if (cargos && !cargos.includes(perfil.cargo)) return <SemPermissao />;

  return children;
}
