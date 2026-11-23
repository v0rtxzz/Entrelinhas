// Envio da imagem de capa para o Supabase Storage (bucket "capas").
// Só a equipe consegue enviar — a política do bucket confere isso.
import { supabase } from '../config/supabase.js';

const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2 MB

export async function enviarCapa(arquivo) {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new Error('Envie uma imagem JPG, PNG ou WEBP.');
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    throw new Error('A imagem precisa ter no máximo 2 MB.');
  }

  const extensao = arquivo.name.split('.').pop().toLowerCase();
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const { error } = await supabase.storage.from('capas').upload(caminho, arquivo, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error('Não foi possível enviar a capa. Tente novamente.');

  const { data } = supabase.storage.from('capas').getPublicUrl(caminho);
  return data.publicUrl;
}
