interface ImportMeta {
  env: {
    // A chave do TMDb que já existia
    VITE_TMDB_API_KEY: string;

    // ✅ ADICIONE ESTAS DUAS LINHAS PARA O SUPABASE
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;

    // Adicione outras variáveis de ambiente aqui conforme necessário
  }
}