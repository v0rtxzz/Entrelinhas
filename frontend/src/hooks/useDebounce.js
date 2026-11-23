import { useEffect, useState } from 'react';

// Espera o usuário parar de digitar (ex.: 400 ms) antes de atualizar o
// valor. Evita chamar a API a cada letra na busca do acervo.
export function useDebounce(valor, atraso = 400) {
  const [valorAtrasado, setValorAtrasado] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setValorAtrasado(valor), atraso);
    return () => clearTimeout(timer);
  }, [valor, atraso]);

  return valorAtrasado;
}
