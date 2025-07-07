// arquivo: src/services/watchlistService.ts

import { supabase } from '../lib/supabaseClient';

/**
 * Adiciona um filme à watchlist do usuário.
 */
export const addMovieToWatchlist = async (userId: string, movieId: number): Promise<void> => {
  const { error } = await supabase
    .from('watchlist')
    .insert({ user_id: userId, movie_id: movieId });

  if (error) {
    console.error('Erro ao adicionar à watchlist:', error);
    throw new Error('Não foi possível adicionar o filme à watchlist.');
  }
};

/**
 * Remove um filme da watchlist do usuário.
 */
export const removeMovieFromWatchlist = async (userId: string, movieId: number): Promise<void> => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId);

  if (error) {
    console.error('Erro ao remover da watchlist:', error);
    throw new Error('Não foi possível remover o filme da watchlist.');
  }
};

/**
 * Verifica se um filme específico está na watchlist do usuário.
 * Retorna true se estiver, false caso contrário.
 */
export const isMovieInWatchlist = async (userId: string, movieId: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('movie_id')
    .eq('user_id', userId)
    .eq('movie_id', movieId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignora o erro 'PGRST116' (nenhuma linha encontrada)
    console.error('Erro ao verificar a watchlist:', error);
    throw new Error('Erro ao verificar a watchlist.');
  }

  return !!data;
};

/**
 * Busca todos os IDs de filmes da watchlist de um usuário.
 */
export const getWatchlist = async (userId: string): Promise<number[]> => {
    const { data, error } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar a watchlist:', error);
        throw new Error('Não foi possível buscar a sua watchlist.');
    }

    return data.map(item => item.movie_id);
};