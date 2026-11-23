// =====================================================================
// MAPA DE TELAS (rotas do front-end)
// ---------------------------------------------------------------------
//  /                          Acervo (vitrine + filtros + destaques)
//  /livros/:id                Ficha do livro + resenhas
//  /entrar  /cadastrar        Login e cadastro
//  /esqueci-senha /nova-senha Recuperação de senha
//  /perfil                    🔑 Área do usuário
//  /painel                    📚 Painel da Biblioteca (bibliotecária/admin)
//  /painel/livros/novo        📚 Cadastrar livro
//  /painel/livros/:id/editar  📚 Editar livro
//  /admin                     🛡️ Painel Administrativo (só admin)
// =====================================================================
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import RotaProtegida from './components/rotas/RotaProtegida.jsx';
import TelaCarregamento from './components/avela/TelaCarregamento.jsx';

import Acervo from './pages/Acervo.jsx';
import DetalheLivro from './pages/DetalheLivro.jsx';
import Perfil from './pages/Perfil.jsx';
import NaoEncontrado from './pages/NaoEncontrado.jsx';
import Entrar from './pages/auth/Entrar.jsx';
import Cadastrar from './pages/auth/Cadastrar.jsx';
import EsqueciSenha from './pages/auth/EsqueciSenha.jsx';
import NovaSenha from './pages/auth/NovaSenha.jsx';
import PainelBiblioteca from './pages/painel/PainelBiblioteca.jsx';
import FormLivro from './pages/painel/FormLivro.jsx';
import PainelAdmin from './pages/painel/PainelAdmin.jsx';

const EQUIPE = ['bibliotecaria', 'admin'];

export default function App() {
  const { carregando } = useAuth();
  const [abertura, setAbertura] = useState(true);

  // RNF03 — Avelã + novelo + patinhas na abertura do site
  if (abertura) {
    return <TelaCarregamento pronto={!carregando} aoTerminar={() => setAbertura(false)} />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Acervo />} />
        <Route path="livros/:id" element={<DetalheLivro />} />

        <Route path="entrar" element={<Entrar />} />
        <Route path="cadastrar" element={<Cadastrar />} />
        <Route path="esqueci-senha" element={<EsqueciSenha />} />
        <Route path="nova-senha" element={<NovaSenha />} />

        <Route
          path="perfil"
          element={
            <RotaProtegida>
              <Perfil />
            </RotaProtegida>
          }
        />

        <Route
          path="painel"
          element={
            <RotaProtegida cargos={EQUIPE}>
              <PainelBiblioteca />
            </RotaProtegida>
          }
        />
        <Route
          path="painel/livros/novo"
          element={
            <RotaProtegida cargos={EQUIPE}>
              <FormLivro />
            </RotaProtegida>
          }
        />
        <Route
          path="painel/livros/:id/editar"
          element={
            <RotaProtegida cargos={EQUIPE}>
              <FormLivro />
            </RotaProtegida>
          }
        />

        <Route
          path="admin"
          element={
            <RotaProtegida cargos={['admin']}>
              <PainelAdmin />
            </RotaProtegida>
          }
        />

        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  );
}
