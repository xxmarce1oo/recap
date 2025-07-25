// arquivo: src/contexts/WatchlistContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Movie } from '../models/movie'; // Importe a interface Movie
import { getWatchlist } from '../services/watchlistService'; // Importe o serviço de watchlist
import { getMovieDetails } from '../services/tmdbService'; // Importe o serviço de detalhes de filmes
import { useAuth } from './AuthContext'; // Para obter o usuário logado

interface WatchlistContextType {
  watchlistMovies: Movie[];
  isLoadingWatchlist: boolean;
  errorWatchlist: string | null;
  fetchWatchlist: (forceRefresh?: boolean) => Promise<void>; // Função para buscar/atualizar a watchlist
}

export const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth(); // Acessa o usuário do AuthContext
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [errorWatchlist, setErrorWatchlist] = useState<string | null>(null);

  // Função para buscar a watchlist
  const fetchWatchlist = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setWatchlistMovies([]); // Limpa a watchlist se não houver usuário
      setIsLoadingWatchlist(false);
      return;
    }

    // Se já temos dados e não é um refresh forçado, não carregamos novamente.
    // Isso evita o "carregando" em cada navegação.
    if (!forceRefresh && watchlistMovies.length > 0 && !isLoadingWatchlist && !errorWatchlist) {
        console.log("Watchlist já carregada, usando dados em cache.");
        return;
    }

    setIsLoadingWatchlist(true);
    setErrorWatchlist(null); // Limpa erros anteriores

    try {
      const movieIds = await getWatchlist(user.id);
      
      if (movieIds.length === 0) {
        setWatchlistMovies([]);
        return;
      }

      // Buscar detalhes dos filmes em paralelo
      const moviePromises = movieIds.map(id => getMovieDetails(id).catch((err) => {
          console.error(`Erro ao buscar detalhes do filme ${id}:`, err);
          return null; // Retorna null para filmes que falharam
      }));
      const movies = (await Promise.all(moviePromises)).filter(Boolean) as Movie[]; // Filtra nulos
      
      setWatchlistMovies(movies);
      
    } catch (err: any) {
      console.error("Erro ao carregar a watchlist:", err);
      setErrorWatchlist("Não foi possível carregar sua watchlist.");
      setWatchlistMovies([]); // Limpa a lista em caso de erro
    } finally {
      setIsLoadingWatchlist(false);
    }
  }, [user, watchlistMovies.length, isLoadingWatchlist, errorWatchlist]); // Dependências do useCallback

  // Efeito para carregar a watchlist quando o usuário autentica ou muda
  useEffect(() => {
    if (!authLoading) { // Só tenta buscar se o status de autenticação já foi determinado
      fetchWatchlist();
    }
  }, [user, authLoading, fetchWatchlist]); // Dependências: user e authLoading, e a própria função fetchWatchlist

  // O valor que será disponibilizado para os componentes filhos
  const value = {
    watchlistMovies,
    isLoadingWatchlist,
    errorWatchlist,
    fetchWatchlist,
  };

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};

// Hook customizado para usar o contexto da watchlist
export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};