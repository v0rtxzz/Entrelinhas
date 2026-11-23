import Logo from '../avela/Logo.jsx';

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__conteudo">
        <Logo claro />
        <p>
          Biblioteca digital do SESI/SENAI · Feito com carinho (e algumas folhas de planta 🌿) pela equipe Entrelinhas.
        </p>
      </div>
    </footer>
  );
}
