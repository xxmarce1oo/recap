// ficheiro: src/services/logService.ts

import { supabase } from '../lib/supabaseClient';
import { getMovieDetails } from './tmdbService';
import { Movie } from '../models/movie';

// Esta interface combina os nossos dados de log com os detalhes completos do filme.
export interface EnrichedLog {
  id: number;
  watched_date: string;
  rating: number;
  review_text: string | null;
  is_liked: boolean;
  is_rewatch: boolean;
  movie: Movie; // O objeto completo do filme está aninhado aqui.
}

// Tipos para as nossas opções de filtro e ordenação
export interface SortOptions {
  by: 'watched_date' | 'rating';
  order: 'desc' | 'asc';
}

export interface FilterOptions {
  rating?: number;
}

/**
 * Busca os logs mais recentes de um utilizador e enriquece-os com os detalhes dos filmes.
 * Usado na página de perfil para a secção "Atividade Recente".
 * @param userId - O ID do utilizador.
 * @param limit - O número de logs a serem obtidos.
 * @returns Uma promessa que resolve para uma matriz de logs enriquecidos.
 */
export const getRecentEnrichedLogs = async (userId: string, limit: number = 5): Promise<EnrichedLog[]> => {
  const { data: logs, error: logsError } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', userId)
    .order('watched_date', { ascending: false })
    .limit(limit);

  if (logsError) {
    console.error('Erro ao buscar logs:', logsError);
    throw logsError;
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  const movieIds = [...new Set(logs.map((log) => log.movie_id))];
  const movieDetailsPromises = movieIds.map(id => getMovieDetails(id));
  const movieDetailsArray = await Promise.all(movieDetailsPromises);
  const movieDetailsMap = new Map(movieDetailsArray.map(movie => [movie.id, movie]));

  const enrichedLogs: EnrichedLog[] = logs.map(log => ({
    ...log,
    movie: movieDetailsMap.get(log.movie_id)!,
  })).filter(log => log.movie);

  return enrichedLogs;
};


/**
 * Busca os logs de um utilizador de forma paginada, com filtros e ordenação.
 * @param userId - O ID do utilizador.
 * @param page - O número da página a ser obtida (começando em 1).
 * @param pageSize - O número de logs por página.
 * @param sort - As opções de ordenação.
 * @param filters - As opções de filtro.
 * @returns Uma promessa que resolve para um objeto contendo os logs e o número total de páginas.
 */
export const getPaginatedEnrichedLogs = async (
  userId: string,
  page: number = 1,
  pageSize: number = 32,
  sort: SortOptions = { by: 'watched_date', order: 'desc' },
  filters: FilterOptions = {}
): Promise<{ logs: EnrichedLog[]; totalPages: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('logs')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Aplicar filtros
  if (filters.rating) {
    query = query.eq('rating', filters.rating);
  }

  // Apanhar a contagem antes da paginação
  const countQuery = query;

  // Aplicar ordenação e paginação
  query = query.order(sort.by, { ascending: sort.order === 'asc' });
  query = query.range(from, to);

  const { data: logs, error: logsError, count } = await query;

  if (logsError) {
    console.error('Erro ao buscar logs paginados:', logsError);
    throw logsError;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  if (!logs || logs.length === 0) {
    return { logs: [], totalPages };
  }

  // Enriquecer os dados com os detalhes dos filmes
  const movieIds = [...new Set(logs.map((log) => log.movie_id))];
  const movieDetailsPromises = movieIds.map(id => getMovieDetails(id));
  const movieDetailsArray = await Promise.all(movieDetailsPromises);
  const movieDetailsMap = new Map(movieDetailsArray.map(movie => [movie.id, movie]));

  const enrichedLogs: EnrichedLog[] = logs.map(log => ({
    ...log,
    movie: movieDetailsMap.get(log.movie_id)!,
  })).filter(log => log.movie);

  return { logs: enrichedLogs, totalPages };
};