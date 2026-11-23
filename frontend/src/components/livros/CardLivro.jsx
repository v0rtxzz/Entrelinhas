// Card da vitrine (RF12): capa, título, autor, selo etário, status e estrelas
import { Link } from 'react-router-dom';
import CapaLivro from './CapaLivro.jsx';
import { Estrelas } from './Estrelas.jsx';
import { SeloClassificacao, SeloStatus } from './Selos.jsx';

export default function CardLivro({ livro, posicao }) {
  return (
    <article className="card-livro">
      <Link to={`/livros/${livro.id}`} className="card-livro__link">
        <div className="card-livro__capa">
          <CapaLivro livro={livro} />
          <SeloClassificacao valor={livro.classificacao_etaria} />
          {posicao && <span className="card-livro__posicao">#{posicao}</span>}
        </div>
        <div className="card-livro__info">
          <h3 className="card-livro__titulo">{livro.titulo}</h3>
          <p className="card-livro__autor">{livro.autor}</p>
          <div className="card-livro__rodape">
            <Estrelas valor={livro.media_estrelas} tamanho={15} mostrarNumero total={livro.total_avaliacoes} />
            <SeloStatus valor={livro.status_disponibilidade} />
          </div>
        </div>
      </Link>
    </article>
  );
}
