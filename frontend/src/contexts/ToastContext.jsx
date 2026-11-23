// =====================================================================
// AVISOS NA TELA (toasts) — RNF05 "Feedback visual imediato"
// Uso em qualquer componente:
//   const { avisar } = useToast();
//   avisar('Resenha publicada!');            // sucesso (padrão)
//   avisar('Algo deu errado', 'erro');
//   avisar('Dica: use os filtros', 'info');
// =====================================================================
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Avela from '../components/avela/Avela.jsx';

const ToastContext = createContext(null);
const DURACAO_MS = 4500;

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);

  const fechar = useCallback((id) => setAvisos((lista) => lista.filter((a) => a.id !== id)), []);

  const avisar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
      setAvisos((lista) => [...lista.slice(-3), { id, mensagem, tipo }]);
      setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`toast toast--${aviso.tipo}`}>
            <Avela tamanho={34} expressao={aviso.tipo === 'erro' ? 'preocupado' : 'feliz'} decorativo />
            <p>{aviso.mensagem}</p>
            <button type="button" className="toast__fechar" onClick={() => fechar(aviso.id)} aria-label="Fechar aviso">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return contexto;
}
