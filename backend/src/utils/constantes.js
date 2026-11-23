// Valores aceitos pelo sistema. Devem bater com os "check" do banco
// (database/migrations/01_tabelas.sql) e com frontend/src/utils/constantes.js
export const CARGOS = ['usuario', 'bibliotecaria', 'admin'];

export const CLASSIFICACOES = ['L', '10', '12', '14', '16', '18'];

export const STATUS_DISPONIBILIDADE = ['disponivel', 'emprestado', 'consulta_local'];

export const AVATARES = ['classico', 'leitor', 'cachecol', 'laco', 'noturno', 'formatura'];

// Ordenações do catálogo (RF15) -> coluna e direção no banco
export const ORDENACOES = {
  az: [{ coluna: 'titulo', ascendente: true }],
  za: [{ coluna: 'titulo', ascendente: false }],
  nota: [
    { coluna: 'media_estrelas', ascendente: false },
    { coluna: 'total_avaliacoes', ascendente: false },
  ],
  recentes: [{ coluna: 'created_at', ascendente: false }],
};

export const POR_PAGINA_PADRAO = 12;
export const POR_PAGINA_MAXIMO = 48;
