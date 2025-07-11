// arquivo: src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Pega a URL e a chave do Supabase das nossas variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// --- DEBUGGING ---
console.log('[SupabaseClient] Tentando inicializar o cliente...');
console.log('[SupabaseClient] VITE_SUPABASE_URL:', supabaseUrl ? 'Carregada' : 'NÃO CARREGADA OU VAZIA');
console.log('[SupabaseClient] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Carregada' : 'NÃO CARREGADA OU VAZIA');
// ---------------

// Validação para garantir que o cliente não seja criado com valores vazios
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[SupabaseClient] Erro Crítico: As variáveis de ambiente do Supabase não foram encontradas.');
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não estão definidas no seu arquivo .env.local');
}

// Cria e exporta o cliente Supabase.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('[SupabaseClient] Cliente Supabase foi criado.');