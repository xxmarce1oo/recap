// arquivo: src/pages/WatchlistPage.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWatchlist } from '../services/watchlistService';
import { getMovieDetails } from '../services/tmdbService';
import { Movie } from '../models/movie';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';
import WatchlistImporter from '../components/WatchlistImporter'; // <-- ADICIONE ESTA LINHA

// ✅ CORREÇÃO: A palavra "default" estava faltando aqui.
export default function WatchlistPage() {
  const { user, isLoading: authLoading } = useAuth(); // Renomeado para evitar conflito
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchWatchlistData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const movieIds = await getWatchlist(user.id);
        
        if (movieIds.length === 0) {
            setWatchlistMovies([]);
            setIsLoading(false);
            return;
        }

        const moviePromises = movieIds.map(id => getMovieDetails(id).catch(() => null));
        const movies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[];
        setWatchlistMovies(movies);
        
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar sua watchlist.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
        fetchWatchlistData();
    }
  }, [user, authLoading]);

  if (authLoading) {
      return <div className="text-center py-24">A carregar...</div>;
  }

  if (!user) {
      return (
          <div className="container mx-auto px-6 md:px-12 text-center py-24">
              <h1 className="text-2xl font-bold">Acesso Negado</h1>
              <p className="text-gray-400 mt-2">Você precisa estar logado para ver sua watchlist.</p>
              <Link to="/" className="text-cyan-400 mt-4 inline-block hover:underline">
                Voltar para a página inicial
              </Link>
          </div>
      )
  }
  const handleImportSuccess = () => {
    // Recarrega a watchlist após a importação
    setWatchlistMovies([]);
    setIsLoading(true);
    getWatchlist(user.id).then(movieIds => {
      const moviePromises = movieIds.map(id => getMovieDetails(id).catch(() => null));
      Promise.all(moviePromises).then(movies => {
        setWatchlistMovies(movies.filter(Boolean) as Movie[]);
        setIsLoading(false);
      });
    });
  };
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-20 md:py-24">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">Minha Watchlist</h1>
        {/* ADICIONE O COMPONENTE DO IMPORTADOR AQUI */}
        <div className="mb-6 sm:mb-8">
          <WatchlistImporter onImportComplete={handleImportSuccess} />
        </div>
        
        {isLoading ? (
          <p className="text-center text-base sm:text-lg">Carregando sua lista...</p>
        ) : error ? (
          <p className="text-center text-base sm:text-lg text-red-500">{error}</p>
        ) : watchlistMovies.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {watchlistMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold">Sua watchlist está vazia</h2>
            <p className="text-gray-400 mt-2">Adicione filmes clicando no ícone de relógio na página de um filme.</p>
            <Link to="/movies/popular" className="mt-6 inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Explorar Filmes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}