// arquivo: src/services/statsService.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Busca a contagem total de filmes únicos que um usuário assistiu.
 */
export const getUniqueFilmCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .rpc('get_unique_movie_count_for_user', { p_user_id: userId });

  if (error) {
    console.error('Erro ao buscar contagem de filmes:', error);
    throw error;
  }

  return data || 0;
};

/**
 * Busca a contagem de reviews (logs com texto) que um usuário escreveu.
 */
export const getReviewCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('review_text', 'is', null) // Conta apenas se review_text não for nulo
    .filter('review_text', 'neq', ''); // E também não for uma string vazia

  if (error) {
    console.error('Erro ao buscar contagem de reviews:', error);
    throw error;
  }

  return count ?? 0;
};
export type RatingsDistribution = {
    [rating: string]: number;
  };
  
  /**
   * Busca a distribuição de todas as notas dadas por um utilizador.
   */
  export const getRatingsDistribution = async (userId: string): Promise<RatingsDistribution> => {
    const { data, error } = await supabase
      .rpc('get_ratings_distribution_for_user', { p_user_id: userId });
  
    if (error) {
      console.error('Erro ao buscar distribuição de notas:', error);
      throw error;
    }
  
    return data || {};
  };