import { Link } from 'react-router-dom';
import EstadoVazio from '../components/avela/EstadoVazio.jsx';

export default function NaoEncontrado() {
  return (
    <div className="container">
      <EstadoVazio
        titulo="Essa página se perdeu entre as linhas…"
        mensagem="O Avelã procurou em todas as estantes e não encontrou o endereço."
        expressao="preocupado"
        variante="classico"
      >
        <Link to="/" className="botao botao--primario">
          Voltar ao acervo
        </Link>
      </EstadoVazio>
    </div>
  );
}
