// Cliente do Supabase no navegador.
// Usado para: login, cadastro, sair, recuperar senha e enviar capas.
// Os DADOS do sistema (livros, resenhas...) passam pelo back-end: services/api.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !chave) {
  // Aparece no console do navegador para ajudar a configurar
  console.error(
    '[Entrelinhas] Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Copie frontend/.env.example para frontend/.env e preencha.',
  );
}

export const supabase = createClient(url || 'http://localhost', chave || 'chave-ausente');
