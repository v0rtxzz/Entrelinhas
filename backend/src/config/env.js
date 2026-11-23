// Lê e confere as variáveis de ambiente em UM só lugar.
// Se faltar alguma obrigatória, a API avisa logo ao iniciar.
import 'dotenv/config';

function obrigatoria(nome) {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`Variável de ambiente ${nome} não definida. Confira o arquivo .env (veja .env.example).`);
  }
  return valor;
}

export const env = {
  supabaseUrl: obrigatoria('SUPABASE_URL'),
  supabaseAnonKey: obrigatoria('SUPABASE_ANON_KEY'),
  porta: Number(process.env.PORT) || 3001,
  frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
};
