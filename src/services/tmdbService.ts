// arquivo: src/services/tmdbService.ts

import { ApiResponse, Movie } from '../models/movie'
import axios from 'axios'

// --- CONSTANTES ---
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// --- INTERFACES ---

// Interface para os resultados da busca "multi" (filmes, séries, etc.)
export interface MultiSearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string; // Para filmes
  name?: string; // Para séries
  poster_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string; // Para filmes
  first_air_date?: string; // Para séries
  original_title?: string; // Para filmes
  original_name?: string; // Para séries
  popularity?: number;
  runtime?: number;
}


// --- FUNÇÕES DE BUSCA DE LISTAS DE FILMES ---

export const getNowPlayingMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

export const getTopRatedMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

export const getPopularMovies = async (page: number = 1): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=${page}`
  )
  return await response.json()
}

// --- FUNÇÕES DE BUSCA E UTILIDADE ---

export const getImageUrl = (path: string, size: string = 'w500') => {
  return `${IMAGE_BASE_URL}/${size}${path}`
}

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

export const searchMovies = async (query: string, language: string = 'pt-BR'): Promise<ApiResponse<Movie>> => {
  if (!query) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${language}`
  );
  return await response.json();
};

export const searchMulti = async (query: string, language: string = 'en-US'): Promise<ApiResponse<MultiSearchResult>> => {
  if (!query) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  const response = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=${language}`
  );
  return await response.json();
};

export const getBestMovieBackdrops = async (movieId: number): Promise<any[]> => {
  try {
    const imagesData = await getMovieImages(movieId);
    const backdrops = imagesData.backdrops || [];

    const sortedBackdrops = backdrops.sort((a: any, b: any) => {
      if (a.vote_count > b.vote_count) return -1;
      if (a.vote_count < b.vote_count) return 1;
      if (a.vote_average > b.vote_average) return -1;
      if (a.vote_average < b.vote_average) return 1;
      return 0;
    });

    return sortedBackdrops.slice(0, 10);
  } catch (error) {
    console.error("Erro ao buscar e ordenar banners:", error);
    return [];
  }
};

export const getMovieKeywords = async (movieId: number): Promise<{ id: number; name: string }[]> => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/keywords?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data.keywords || [];
};