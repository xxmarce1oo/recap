// arquivo: src/services/recommendationService.ts

import { getRecentEnrichedLogs } from './logService';
import { getMovieKeywords, getMovieDetails } from './tmdbService';
import { Movie } from '../models/movie';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Embaralha um array de forma aleatória.
 * @param array O array a ser embaralhado.
 * @returns O array embaralhado.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Gera recomendações de filmes com base no conteúdo dos filmes mais bem avaliados pelo usuário.
 * @param userId O ID do usuário.
 * @param count O número de recomendações a serem geradas.
 * @returns Uma promessa que resolve para um array de filmes recomendados.
 */
export const getContentBasedRecommendations = async (userId: string, count: number = 6): Promise<Movie[]> => {
  // 1. Obter os 20 últimos filmes registrados pelo usuário.
  const recentLogs = await getRecentEnrichedLogs(userId, 20);

  if (recentLogs.length === 0) {
    return [];
  }

  // Tenta pegar os 5 últimos filmes com nota 4 ou maior.
  let seedMovies = recentLogs.filter(log => log.rating >= 4.0).slice(0, 5);

  // Fallback: Se não houver filmes com nota alta, usa os 5 mais recentes.
  if (seedMovies.length === 0) {
    seedMovies = recentLogs.slice(0, 5);
  }
  
  if (seedMovies.length === 0) {
    return [];
  }

  const seenMovieIds = new Set(recentLogs.map(log => log.movie.id));

  // 2. Extrair gêneros e palavras-chave dos filmes "semente"
  const genreFrequency: { [id: number]: number } = {};
  const keywordFrequency: { [id: number]: number } = {};

  for (const log of seedMovies) {
    log.movie.genres?.forEach(genre => {
      genreFrequency[genre.id] = (genreFrequency[genre.id] || 0) + 1;
    });
    try {
      const keywords = await getMovieKeywords(log.movie.id);
      keywords.slice(0, 10).forEach(kw => {
        keywordFrequency[kw.id] = (keywordFrequency[kw.id] || 0) + 1;
      });
    } catch (error) {
        console.warn(`Não foi possível buscar keywords para o filme ID ${log.movie.id}`, error);
    }
  }

  // 3. Montar o perfil de gosto
  const topGenres = Object.entries(genreFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(entry => entry[0]);

  const topKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  if (topGenres.length === 0) {
    return [];
  }

  // 4. ✅ MUDANÇA PRINCIPAL: Buscar um pool maior de candidatos
  const discoverUrlPage1 = new URL(`${BASE_URL}/discover/movie`);
  discoverUrlPage1.searchParams.append('api_key', API_KEY);
  discoverUrlPage1.searchParams.append('language', 'pt-BR');
  discoverUrlPage1.searchParams.append('sort_by', 'popularity.desc');
  discoverUrlPage1.searchParams.append('with_genres', topGenres.join(','));
  if (topKeywords.length > 0) {
    discoverUrlPage1.searchParams.append('with_keywords', topKeywords.join('|'));
  }
  discoverUrlPage1.searchParams.append('vote_count.gte', '100');
  discoverUrlPage1.searchParams.append('page', '1');

  const discoverUrlPage2 = new URL(discoverUrlPage1);
  discoverUrlPage2.searchParams.set('page', '2');

  const [response1, response2] = await Promise.all([
    fetch(discoverUrlPage1.toString()),
    fetch(discoverUrlPage2.toString())
  ]);
  
  const data1 = await response1.json();
  const data2 = await response2.json();
  
  const candidateMovies = [...data1.results, ...data2.results];

  // 5. Filtrar filmes já vistos
  const unseenCandidates = candidateMovies.filter((movie: Movie) => !seenMovieIds.has(movie.id));
  
  // 6. ✅ NOVO: Embaralhar os candidatos e pegar a quantidade desejada
  const shuffledRecommendations = shuffleArray(unseenCandidates);
  
  return shuffledRecommendations.slice(0, count);
};