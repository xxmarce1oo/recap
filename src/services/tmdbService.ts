// tmdbService.ts

import { ApiResponse, Movie } from '../models/movie'
import axios from 'axios'

// --- CONSTANTES ---
// Mantendo as constantes no topo para fácil manutenção
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// --- FUNÇÕES DE BUSCA DE LISTAS DE FILMES ---

export const getNowPlayingMovies = async (): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR`
  )
  return await response.json()
}

export const getTopRatedMovies = async (): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=pt-BR`
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

/**
 * ✅ FUNÇÃO CORRIGIDA
 * Busca todos os provedores de um filme (streaming, aluguel e compra) para o Brasil.
 * Retorna um array único com todos os provedores, cada um com uma propriedade 'type'.
 */
export const getMovieProviders = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/watch/providers`,
    {
      params: {
        api_key: API_KEY, // Padronizado para usar a constante
      },
    }
  )

  const brProviders = response.data.results?.BR;

  // Se não houver dados para o Brasil, retorna um array vazio.
  if (!brProviders) {
    return [];
  }

  const allProviders: any[] = [];

  // Adiciona os provedores de STREAMING ('flatrate') se existirem
  if (brProviders.flatrate) {
    const providers = brProviders.flatrate.map((p: any) => ({ ...p, type: 'flatrate' }));
    allProviders.push(...providers);
  }
  
  // Adiciona os provedores de ALUGUEL ('rent') se existirem
  if (brProviders.rent) {
    const providers = brProviders.rent.map((p: any) => ({ ...p, type: 'rent' }));
    allProviders.push(...providers);
  }

  // Adiciona os provedores de COMPRA ('buy') se existirem
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
        api_key: API_KEY, // Padronizado para usar a constante
        language: 'pt-BR', // Adicionado para garantir trailers em português quando disponíveis
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

// ✅ NOVA FUNÇÃO ADICIONADA AQUI
export const getMovieImages = async (movieId: number) => {
  const response = await axios.get(
    `${BASE_URL}/movie/${movieId}/images`,
    {
      params: {
        api_key: API_KEY,
      }
    }
  );
  // Retornamos apenas a lista de backdrops para simplificar
  return response.data.backdrops || []; 
};

export const getPopularMovies = async (): Promise<ApiResponse<Movie>> => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`
  )
  return await response.json()
}