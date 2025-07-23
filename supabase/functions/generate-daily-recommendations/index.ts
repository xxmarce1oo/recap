// supabase/functions/generate-daily-recommendations/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- Tipos de Dados ---
interface Log {
  movie_id: number;
  rating: number;
}
interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  genres: { id: number; name: string }[];
  credits: { crew: { id: number; name: string; job: string }[] };
}
interface Recommendation {
  user_id: string;
  recommended_movie_id: number;
  source_movie_ids: number[];
  reason: string;
  category: string; // Coluna que adicionamos para agrupar
}

// --- Constantes ---
const TMDB_API_KEY = Deno.env.get("VITE_TMDB_API_KEY");
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// --- Funções Auxiliares da API TMDB ---
const fetchTMDB = async (endpoint: string) => {
  const allResults: any[] = [];
  // Busca até 3 páginas para ter um bom número de candidatos
  for (let page = 1; page <= 3; page++) {
    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}&language=pt-BR&page=${page}`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        allResults.push(...(data.results || []));
        if (!data.total_pages || page >= data.total_pages) break;
      } else {
        break;
      }
    } catch (e) {
      console.error(`Falha ao buscar TMDB: ${url}`, e);
      break;
    }
  }
  return allResults;
};

const getMovieDetails = (id: number): Promise<MovieDetails | null> => fetchTMDB(`/movie/${id}?append_to_response=credits`).then(r => r[0]);
const getMovieProviders = async (id: number) => (await fetchTMDB(`/movie/${id}/watch/providers?`))?.[0]?.results?.BR?.flatrate || [];

// --- Lógica Principal de Geração ---
const processUserRecommendations = async (supabaseAdmin: SupabaseClient, userId: string) => {
  console.log(`--- Iniciando recomendações para o usuário: ${userId} ---`);

  const { data: recentLogsData } = await supabaseAdmin.from("logs").select("movie_id, rating").eq("user_id", userId).order("watched_date", { ascending: false }).limit(20);
  const recentLogs = recentLogsData as Log[] || [];
  if (recentLogs.length < 3) return console.log(`[INFO] Usuário ${userId} sem logs suficientes.`);

  const { data: allLogsData } = await supabaseAdmin.from("logs").select("movie_id").eq("user_id", userId);
  const seenMovieIds = new Set((allLogsData as { movie_id: number }[])?.map(log => log.movie_id));

  const finalRecs: Recommendation[] = [];
  const recommendedMovieIds = new Set<number>();
  const uniqueLogs = Array.from(new Map(recentLogs.map(log => [log.movie_id, log])).values());

  // Função auxiliar para validar e adicionar filmes à lista final
  const addRecsToFinalList = async (candidates: any[], category: string, reason: string, count: number) => {
    let addedCount = 0;
    for (const candidate of candidates) {
      if (addedCount >= count) break;
      if (seenMovieIds.has(candidate.id) || recommendedMovieIds.has(candidate.id)) continue;

      const details = await getMovieDetails(candidate.id);
      if (!details || !details.overview) continue;
      
      const providers = await getMovieProviders(candidate.id);
      if (providers.length === 0) continue;

      finalRecs.push({
        user_id: userId,
        recommended_movie_id: candidate.id,
        source_movie_ids: uniqueLogs.slice(0, 5).map(l => l.movie_id),
        reason: reason,
        category: category // A categoria que usaremos para agrupar no frontend
      });
      recommendedMovieIds.add(candidate.id);
      addedCount++;
    }
  };

  // CATEGORIA 1: Baseado no filme de maior nota do usuário
  const topRatedLog = uniqueLogs.sort((a, b) => b.rating - a.rating)[0];
  const topMovieDetails = await getMovieDetails(topRatedLog.movie_id);
  if (topMovieDetails) {
    const recs = await fetchTMDB(`/movie/${topMovieDetails.id}/recommendations?`);
    await addRecsToFinalList(recs, "movie", `Porque você assistiu a ${topMovieDetails.title}`, 6);
  }

  // CATEGORIA 2: Gênero favorito
  const genreScores = new Map<number, { name: string; score: number }>();
  const sourceMovieDetails = await Promise.all(uniqueLogs.slice(0, 10).map(log => getMovieDetails(log.movie_id)));
  
  sourceMovieDetails.forEach((details, i) => {
    if (details) {
      const rating = uniqueLogs[i].rating;
      details.genres.forEach(g => {
        const current = genreScores.get(g.id) || { name: g.name, score: 0 };
        genreScores.set(g.id, { ...current, score: current.score + rating });
      });
    }
  });

  const topGenre = [...genreScores.entries()].sort((a, b) => b[1].score - a[1].score)[0];
  if (topGenre) {
    const recs = await fetchTMDB(`/discover/movie?with_genres=${topGenre[0]}&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=6.5`);
    await addRecsToFinalList(recs, "genre", `Porque você gosta de filmes de ${topGenre[1].name}`, 6);
  }

  // CATEGORIA 3: Diretor favorito
  const directorScores = new Map<number, { name: string; score: number }>();
  sourceMovieDetails.forEach((details, i) => {
    if (details) {
      const rating = uniqueLogs[i].rating;
      details.credits.crew.filter(c => c.job === 'Director').forEach(d => {
        const current = directorScores.get(d.id) || { name: d.name, score: 0 };
        directorScores.set(d.id, { ...current, score: current.score + rating });
      });
    }
  });

  const topDirector = [...directorScores.entries()].sort((a, b) => b[1].score - a[1].score)[0];
  if (topDirector) {
      const recs = await fetchTMDB(`/discover/movie?with_crew=${topDirector[0]}&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=6.5`);
      await addRecsToFinalList(recs, "director", `Mais do diretor ${topDirector[1].name}`, 6);
  }

  // Salva no banco de dados
  if (finalRecs.length > 0) {
    await supabaseAdmin.from("daily_recommendations").delete().eq("user_id", userId);
    await supabaseAdmin.from("daily_recommendations").insert(finalRecs);
    console.log(`[SUCESSO] Inserido ${finalRecs.length} recomendações para ${userId}.`);
  }
};

// --- Ponto de Entrada da Função (serve) ---
serve(async (req) => {
  const authHeader = req.headers.get("Authorization")!;
  if (authHeader !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const { data: users } = await supabaseAdmin.from("profiles").select("id");
    if (users) {
      for (const user of (users as {id:string}[])) {
        await processUserRecommendations(supabaseAdmin, user.id);
      }
    }
    return new Response(JSON.stringify({ message: "Processo de recomendações finalizado." }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});