// Janela de confirmação para ações perigosas (RF11 — evitar exclusão acidental)
// Uso:
//   <ModalConfirmar aberto={...} titulo="Excluir livro?" mensagem="..."
//     textoConfirmar="Excluir" perigo aoConfirmar={...} aoCancelar={...} />
import { useEffect, useRef } from 'react';
import Avela from '../avela/Avela.jsx';

export default function ModalConfirmar({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  perigo = false,
  processando = false,
  aoConfirmar,
  aoCancelar,
}) {
  const dialogo = useRef(null);

  // Usa o <dialog> nativo: já cuida de foco e da tecla Esc
  useEffect(() => {
    const el = dialogo.current;
    if (!el) return;
    if (aberto && !el.open) el.showModal();
    if (!aberto && el.open) el.close();
  }, [aberto]);

  return (
    <dialog ref={dialogo} className="modal" onCancel={aoCancelar} aria-labelledby="modal-titulo">
      <Avela tamanho={84} expressao={perigo ? 'preocupado' : 'pensativo'} decorativo />
      <h2 id="modal-titulo">{titulo}</h2>
      {mensagem && <p>{mensagem}</p>}
      <div className="modal__acoes">
        <button type="button" className="botao botao--fantasma" onClick={aoCancelar} disabled={processando}>
          Cancelar
        </button>
        <button
          type="button"
          className={`botao ${perigo ? 'botao--perigo' : 'botao--primario'}`}
          onClick={aoConfirmar}
          disabled={processando}
        >
          {processando ? 'Aguarde…' : textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}
