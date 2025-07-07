// arquivo: src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// Pega a URL e a chave do Supabase das nossas variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Cria e exporta o cliente Supabase.
// Este objeto 'supabase' será usado em toda a aplicação para interagir com o backend.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)