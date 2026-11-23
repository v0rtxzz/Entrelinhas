// Clientes do Supabase usados pela API.
//
// A API usa SÓ a chave pública (anon). Quando o usuário está logado,
// repassamos o token dele para o Supabase. Assim as regras de RLS do
// banco valem também aqui: a API nunca tem "superpoderes".
import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const opcoesSemSessao = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

// Cliente para visitantes (sem login): só consegue ler o que é público.
export const supabasePublico = createClient(env.supabaseUrl, env.supabaseAnonKey, opcoesSemSessao);

// Cliente "em nome do usuário": o banco enxerga auth.uid() = id dele.
export function clienteDoUsuario(token) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...opcoesSemSessao,
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
