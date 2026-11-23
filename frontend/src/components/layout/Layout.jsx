// Estrutura comum de todas as páginas: cabeçalho, conteúdo e rodapé
import { Outlet } from 'react-router-dom';
import Cabecalho from './Cabecalho.jsx';
import Rodape from './Rodape.jsx';

export default function Layout() {
  return (
    <div className="pagina">
      <a href="#conteudo" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="pagina__conteudo">
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
