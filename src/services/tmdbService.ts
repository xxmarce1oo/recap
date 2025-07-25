// arquivo: src/services/tmdbService.ts

import { ApiResponse, Movie } from '../models/movie'
import axios from 'axios'

// --- CONSTANTES ---
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// --- FUNÇÕES DE BUSCA DE LISTAS DE FILMES ---

// ✅ Adicionado o parâmetro 'page' para carregar páginas específicas
export const getNowPlayingMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

// ✅ Adicionado o parâmetro 'page'
export const getTopRatedMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

// ✅ Adicionado o parâmetro 'page' para consistência
export const getPopularMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

// --- FUNÇÕES DE UTILIDADE ---

export const getImageUrl = (path: string, size: string = 'w500') => {
  return `${IMAGE_BASE_URL}/${size}${path}`
}

// --- FUNÇÕES DE BUSCA DE DETALHES DE UM FILME ESPECÍFICO ---

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=pt-BR`
  )
  return await response.json()
}

export const getMovieProviders = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/watch/providers`,
    {
      params: {
        api_key: API_KEY,
      },
    }
  )

  const brProviders = response.data.results?.BR;

  if (!brProviders) {
    return [];
  }

  const allProviders: any[] = [];

  if (brProviders.flatrate) {
    const providers = brProviders.flatrate.map((p: any) => ({ ...p, type: 'flatrate' }));
    allProviders.push(...providers);
  }
  
  if (brProviders.rent) {
    const providers = brProviders.rent.map((p: any) => ({ ...p, type: 'rent' }));
    allProviders.push(...providers);
  }

  if (brProviders.buy) {
    const providers = brProviders.buy.map((p: any) => ({ ...p, type: 'buy' }));
    allProviders.push(...providers);
  }

  return allProviders;
}

export const getMovieVideos = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/videos`,
    {
      params: {
        api_key: API_KEY,
        language: 'pt-BR',
      },
    }
  )
  return response.data.results
}

export const getMovieCredits = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/credits`,
    {
      params: {
        api_key: API_KEY,
        language: 'pt-BR'
      }
    }
  )
  return response.data
}

export const getMovieReleaseDates = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/release_dates`,
    {
      params: {
        api_key: API_KEY
      }
    }
  )
  return response.data.results
}

export const getMovieImages = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/images`,
    {
      params: {
        api_key: API_KEY,
      }
    }
  );
  return response.data; 
};

// A função searchMovies foi atualizada para aceitar um idioma
export const searchMovies = async (query: string, language: string = 'pt-BR'): Promise<ApiResponse<Movie>> => {
  if (!query) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${language}`
  );
  return await response.json();
};


/**
 * Busca as imagens de um filme, ordena os backdrops por relevância (votos e nota)
 * e retorna os 10 melhores.
 * @param movieId O ID do filme.
 * @returns Uma promessa que resolve para um array dos 10 melhores backdrops.
 */
export const getBestMovieBackdrops = async (movieId: number): Promise<any[]> => {
  try {
    const imagesData = await getMovieImages(movieId);
    const backdrops = imagesData.backdrops || [];

    // Algoritmo de relevância para ordenar os banners
    const sortedBackdrops = backdrops.sort((a: any, b: any) => {
      // Critério 1: Priorizar imagens com mais votos
      if (a.vote_count > b.vote_count) return -1;
      if (a.vote_count < b.vote_count) return 1;

      // Critério 2: Priorizar imagens com maior média de votos
      if (a.vote_average > b.vote_average) return -1;
      if (a.vote_average < b.vote_average) return 1;
      
      return 0; // Manter a ordem se tudo for igual
    });

    return sortedBackdrops.slice(0, 10); // Retorna apenas os 10 melhores
  } catch (error) {
    console.error("Erro ao buscar e ordenar banners:", error);
    // Em caso de erro, retorna um array vazio. O componente lidará com o fallback.
    return [];
  }
};