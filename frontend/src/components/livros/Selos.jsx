// Selos visuais: classificação etária (RF19) e disponibilidade (RF08)
import { CLASSIFICACOES, STATUS, rotuloDe } from '../../utils/constantes.js';

export function SeloClassificacao({ valor, grande = false }) {
  const rotulo = rotuloDe(CLASSIFICACOES, valor);
  return (
    <span
      className={`selo-idade selo-idade--${valor} ${grande ? 'selo-idade--g' : ''}`}
      title={`Classificação: ${rotulo}`}
      aria-label={`Classificação etária: ${rotulo}`}
    >
      {valor}
    </span>
  );
}

export function SeloStatus({ valor }) {
  return <span className={`selo-status selo-status--${valor}`}>{rotuloDe(STATUS, valor)}</span>;
}
