import Avela from './Avela.jsx';

export default function Logo({ claro = false }) {
  return (
    <span className={`logo ${claro ? 'logo--claro' : ''}`}>
      <Avela tamanho={40} somenteRosto decorativo />
      <span className="logo__texto">
        Entre<em>linhas</em>
      </span>
    </span>
  );
}
