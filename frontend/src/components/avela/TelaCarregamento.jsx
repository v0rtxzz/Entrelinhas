// =====================================================================
// TELA DE CARREGAMENTO TEMÁTICA — RNF03
// O Avelã brinca com um novelo de lã enquanto patinhas preenchem a barra.
//
// Props:
//   pronto      -> quando vira true, a barra completa e a tela some
//   aoTerminar  -> chamada depois da animação final
//   telaCheia   -> true na abertura do site; false = versão compacta
//                  (usada dentro das páginas enquanto os dados chegam)
// =====================================================================
import { useEffect, useState } from 'react';
import Avela from './Avela.jsx';

const TOTAL_PATINHAS = 8;

function Patinha({ acesa }) {
  return (
    <svg viewBox="0 0 24 24" className={`patinha ${acesa ? 'patinha--acesa' : ''}`} aria-hidden="true">
      <ellipse cx="12" cy="15.5" rx="5.2" ry="4.4" />
      <ellipse cx="5.6" cy="10" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="6.4" rx="2.2" ry="2.9" />
      <ellipse cx="14.6" cy="6.4" rx="2.2" ry="2.9" />
      <ellipse cx="18.8" cy="10" rx="2.2" ry="2.8" />
    </svg>
  );
}

function Novelo() {
  return (
    <svg viewBox="0 0 40 40" className="novelo" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#6f9460" />
      <g stroke="#4e6b40" strokeWidth="1.8" fill="none" strokeLinecap="round">
        <path d="M7 14 q13 -6 26 6" />
        <path d="M5 21 q15 -8 30 4" />
        <path d="M9 30 q12 -12 24 -16" />
        <path d="M16 35 q4 -14 16 -24" />
      </g>
    </svg>
  );
}

export function BarraPatinhas({ progresso }) {
  return (
    <div
      className="barra-patinhas"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progresso)}
      aria-label="Carregando"
    >
      {Array.from({ length: TOTAL_PATINHAS }, (_, i) => (
        <Patinha key={i} acesa={progresso >= ((i + 1) / TOTAL_PATINHAS) * 100 - 1} />
      ))}
    </div>
  );
}

export default function TelaCarregamento({ pronto = false, aoTerminar, telaCheia = true, mensagem }) {
  const [progresso, setProgresso] = useState(0);

  // Avança a barra aos poucos; acelera quando os dados ficam prontos
  useEffect(() => {
    const timer = setInterval(() => {
      setProgresso((atual) => {
        if (pronto) return Math.min(atual + 18, 100);
        const limite = telaCheia ? 90 : 100;
        const proximo = atual + 4 + Math.random() * 6;
        return telaCheia ? Math.min(proximo, limite) : proximo % 112; // compacta: fica em loop
      });
    }, 130);
    return () => clearInterval(timer);
  }, [pronto, telaCheia]);

  useEffect(() => {
    if (pronto && progresso >= 100 && aoTerminar) {
      const timer = setTimeout(aoTerminar, 300);
      return () => clearTimeout(timer);
    }
  }, [pronto, progresso, aoTerminar]);

  return (
    <div className={telaCheia ? 'carregamento carregamento--cheia' : 'carregamento'}>
      <div className="carregamento__cena">
        <Avela tamanho={telaCheia ? 150 : 96} className="carregamento__gato" decorativo />
        <svg className="carregamento__fio" viewBox="0 0 80 40" aria-hidden="true">
          <path d="M2 34 C 24 40, 40 6, 70 22" stroke="#6f9460" strokeWidth="2" fill="none" />
        </svg>
        <Novelo />
      </div>
      <BarraPatinhas progresso={progresso} />
      <p className="carregamento__texto">{mensagem || 'O Avelã está buscando os livros…'}</p>
    </div>
  );
}
