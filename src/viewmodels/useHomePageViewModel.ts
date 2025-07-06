// arquivo: src/viewmodels/useHomePageViewModel.ts

import { useState, useEffect } from 'react'
import { Movie } from '../models/movie'
import { getNowPlayingMovies, getTopRatedMovies, getPopularMovies } from '../services/tmdbService'

export const useHomePageViewModel = () => {
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([])
  const [topRated, setTopRated] = useState<Movie[]>([])
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null) // Estado para o filme do Hero
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true)
        
        // Buscamos as 3 listas em paralelo
        const [
          nowPlayingData, 
          topRatedData,
          popularData // Nova lista
        ] = await Promise.all([
          getNowPlayingMovies(),
          getTopRatedMovies(),
          getPopularMovies()
        ])

        setNowPlaying(nowPlayingData.results)
        setTopRated(topRatedData.results)

        // Escolhe um filme aleatório da lista de populares para o Hero
        if (popularData.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * popularData.results.length)
          setHeroMovie(popularData.results[randomIndex])
        }

      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return { nowPlaying, topRated, heroMovie, isLoading, error }
}