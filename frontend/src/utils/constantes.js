// =====================================================================
// LISTAS E RÓTULOS DO SISTEMA
// Os códigos (L, 10, disponivel...) precisam bater com o banco de dados
// (database/migrations/01_tabelas.sql) e com backend/src/utils/constantes.js
// =====================================================================

// RF19 — classificação etária (cores no padrão da ClassInd brasileira)
export const CLASSIFICACOES = [
  { valor: 'L', rotulo: 'Livre', curto: 'L' },
  { valor: '10', rotulo: '10 anos', curto: '10' },
  { valor: '12', rotulo: '12 anos', curto: '12' },
  { valor: '14', rotulo: '14 anos', curto: '14' },
  { valor: '16', rotulo: '16 anos', curto: '16' },
  { valor: '18', rotulo: '18 anos', curto: '18' },
];

// RF08 — situação do exemplar físico
export const STATUS = [
  { valor: 'disponivel', rotulo: 'Disponível' },
  { valor: 'emprestado', rotulo: 'Emprestado' },
  { valor: 'consulta_local', rotulo: 'Consulta local' },
];

// RF15 — ordenações do catálogo
export const ORDENACOES = [
  { valor: 'az', rotulo: 'Título: A → Z' },
  { valor: 'za', rotulo: 'Título: Z → A' },
  { valor: 'nota', rotulo: 'Melhor avaliados' },
  { valor: 'recentes', rotulo: 'Cadastrados recentemente' },
];

// Sugestões para o formulário de livro (a bibliotecária pode digitar outros)
export const GENEROS_SUGERIDOS = [
  'Aventura', 'Biografia', 'Didático', 'Fantasia', 'Ficção', 'Ficção Científica',
  'HQ / Mangá', 'Poesia', 'Romance', 'Suspense', 'Técnico', 'Terror',
];

export const TEMATICAS_SUGERIDAS = [
  'Cotidiano', 'Ciências', 'Esportes', 'História', 'Meio Ambiente', 'Mistério',
  'Saúde', 'Sociedade', 'Tecnologia', 'Trabalho e Carreira',
];

// RF06 — cargos
export const CARGOS = [
  { valor: 'usuario', rotulo: 'Estudante' },
  { valor: 'bibliotecaria', rotulo: 'Bibliotecária' },
  { valor: 'admin', rotulo: 'Administrador' },
];

// RF04 — avatares do Avelã (desenhados em components/avela/Avela.jsx)
export const AVATARES = [
  { valor: 'classico', rotulo: 'Clássico' },
  { valor: 'leitor', rotulo: 'Leitor de óculos' },
  { valor: 'cachecol', rotulo: 'Cachecol verde' },
  { valor: 'laco', rotulo: 'Lacinho' },
  { valor: 'noturno', rotulo: 'Soneca' },
  { valor: 'formatura', rotulo: 'Formatura' },
];

export const rotuloDe = (lista, valor) => lista.find((item) => item.valor === valor)?.rotulo ?? valor;
