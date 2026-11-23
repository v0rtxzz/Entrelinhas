// Mensagem amigável com o Avelã quando não há nada para mostrar (RF22)
import Avela from './Avela.jsx';

export default function EstadoVazio({
  titulo = 'Nada por aqui…',
  mensagem,
  expressao = 'pensativo',
  variante = 'leitor',
  children,
}) {
  return (
    <div className="estado-vazio">
      <Avela tamanho={130} expressao={expressao} variante={variante} decorativo />
      <h3>{titulo}</h3>
      {mensagem && <p>{mensagem}</p>}
      {children && <div className="estado-vazio__acoes">{children}</div>}
    </div>
  );
}
