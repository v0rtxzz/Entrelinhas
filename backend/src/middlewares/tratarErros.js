// Último middleware: transforma qualquer erro em uma resposta JSON
// padronizada que o front-end sabe ler:
//   { "erro": "mensagem amigável", "detalhes": { campo: "problema" } }
import { ErroApi } from '../utils/ErroApi.js';

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não existe.` });
}

// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, req, res, _next) {
  if (erro instanceof ErroApi) {
    const resposta = { erro: erro.message };
    // Detalhes de validação vão para o front; detalhes técnicos só no log
    if (erro.status < 500 && erro.detalhes) resposta.detalhes = erro.detalhes;
    if (erro.status >= 500) console.error('[API]', erro.message, erro.detalhes || '');
    return res.status(erro.status).json(resposta);
  }

  // JSON mal formatado no corpo da requisição
  if (erro?.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Corpo da requisição inválido.' });
  }

  console.error('[API] Erro inesperado:', erro);
  res.status(500).json({ erro: 'Erro interno. Tente novamente em instantes.' });
}
