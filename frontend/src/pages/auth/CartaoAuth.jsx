// Moldura visual compartilhada pelas telas de login, cadastro e senha
import Avela from '../../components/avela/Avela.jsx';

export default function CartaoAuth({ titulo, subtitulo, variante = 'classico', children }) {
  return (
    <div className="pagina-auth">
      <div className="cartao-auth">
        <div className="cartao-auth__topo">
          <Avela tamanho={96} variante={variante} decorativo />
          <h1>{titulo}</h1>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
