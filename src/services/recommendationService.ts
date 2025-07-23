// arquivo: src/services/recommendationService.ts

import { supabase } from '../lib/supabaseClient';
import { getMovieDetails } from './tmdbService';
import { Movie } from '../models/movie';

export interface EnrichedRecommendation {
  id: number; // ID da recomendação, não do filme
  reason: string | null;
  status: string;
  movie: Movie;
}

/**
 * Busca as recomendações diárias de um usuário e as enriquece com detalhes dos filmes.
 */
export const getDailyRecommendations = async (userId: string): Promise<EnrichedRecommendation[]> => {
  // 1. Busca as recomendações salvas na nossa tabela
  const { data: recommendations, error } = await supabase
    .from('daily_recommendations')
    .select('id, recommended_movie_id, reason, status')
    .eq('user_id', userId)
    .eq('status', 'pending') 
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar recomendações:', error);
    throw error;
  }

  if (!recommendations || recommendations.length === 0) {
    return [];
  }

  // 2. Pega os detalhes de cada filme recomendado da API do TMDB
  const moviePromises = recommendations.map(rec => getMovieDetails(rec.recommended_movie_id));
  const movies = await Promise.all(moviePromises);

  // 3. Combina os dados para criar um objeto "enriquecido"
  const enrichedRecommendations: EnrichedRecommendation[] = recommendations.map((rec, index) => ({
    id: rec.id,
    reason: rec.reason,
    status: rec.status,
    movie: movies[index],
  })).filter(rec => rec.movie); // Remove qualquer um que tenha falhado na busca

  return enrichedRecommendations;
};

/**
 * Atualiza o status de uma recomendação (ex: quando o usuário a descarta)
 */
export const updateRecommendationStatus = async (recommendationId: number, newStatus: 'viewed' | 'dismissed'): Promise<void> => {
    const { error } = await supabase
        .from('daily_recommendations')
        .update({ status: newStatus })
        .eq('id', recommendationId);
    
    if (error) {
        console.error('Erro ao atualizar status da recomendação:', error);
        throw error;
    }
}