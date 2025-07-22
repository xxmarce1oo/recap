// arquivo: src/services/reviewService.ts

import { supabase } from '../lib/supabaseClient';

// A interface agora representa uma única entrada de log.
export interface LogData {
  userId: string;
  movieId: number;
  rating: number;
  reviewText: string;
  isLiked: boolean;
  watchedDate: string; // Formato 'YYYY-MM-DD'
  isRewatch: boolean;
  posterPath: string | null; // ✅ Adiciona o caminho do pôster
}

/**
 * Salva um novo log de filme no diário.
 * Cada chamada a esta função cria um novo registo na tabela 'logs'.
 */
export const saveLog = async (data: LogData) => {
  const { error } = await supabase.from('logs').insert({
    user_id: data.userId,
    movie_id: data.movieId,
    rating: data.rating,
    review_text: data.reviewText,
    is_liked: data.isLiked,
    watched_date: data.watchedDate,
    is_rewatch: data.isRewatch,
        poster_path: data.posterPath, // ✅ Salva o pôster no banco
  });

  if (error) {
    console.error('Erro ao salvar o log:', error);
    // Este é o erro que você está a ver.
    throw new Error('Não foi possível salvar a sua review/log.');
  }
};

/**
 * Busca o número de vezes que um usuário já registou um filme.
 * Isto ajuda-nos a determinar se o próximo log é um 'rewatch'.
 */
export const getLogCountForMovie = async (userId: string, movieId: number): Promise<number> => {
  const { count, error } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('movie_id', movieId);

  if (error) {
    console.error('Erro ao contar logs:', error);
    throw error;
  }

  return count ?? 0;
};

export const deleteLog = async (logId: number) => {
  const { error } = await supabase
    .from('logs')
    .delete()
    .eq('id', logId);

  if (error) {
    console.error('Erro ao deletar o log:', error);
    throw new Error('Não foi possível deletar a sua review.');
  }
};