// arquivo: src/pages/ListPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Movie } from '../models/movie';
import { getNowPlayingMovies, getTopRatedMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import { FaArrowLeft } from 'react-icons/fa';

// Mapeia os tipos de lista da URL para funções de busca e títulos de página
const listConfig = {
  now_playing: {
    title: 'Lançamentos',
    fetcher: getNowPlayingMovies,
  },
  top_rated: {
    title: 'Melhores Avaliados',
    fetcher: getTopRatedMovies,
  },
};

type ListType = keyof typeof listConfig;

export default function ListPage() {
  const { listType } = useParams<{ listType: ListType }>();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = listType ? listConfig[listType] : null;

  const fetchMovies = useCallback((pageNum: number) => {
    if (!config) return;
    
    // Define o estado de carregamento apropriado (inicial ou de mais itens)
    const loader = pageNum === 1 ? setIsLoading : setIsFetchingMore;
    loader(true);

    config.fetcher(pageNum)
      .then(data => {
        // Se for a primeira página, substitui os filmes. Senão, adiciona os novos.
        setMovies(prev => pageNum === 1 ? data.results : [...prev, ...data.results]);
        setTotalPages(data.total_pages);
        
        // Atualiza o número da próxima página a ser buscada
        setPage(pageNum + 1);
      })
      .catch(err => {
        console.error(err);
        setError('Não foi possível carregar os filmes.');
      })
      .finally(() => {
        loader(false);
      });
  }, [config]);

  // Efeito para carregar os filmes iniciais ou quando a rota muda
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setTotalPages(0);
    setError(null);

    if (listType && config) {
      fetchMovies(1);
    } else {
      setError('Categoria de lista inválida.');
      setIsLoading(false);
    }
  }, [listType]); // A dependência 'fetchMovies' foi removida para evitar loops

  const handleLoadMore = () => {
    if (page <= totalPages && !isFetchingMore) {
      fetchMovies(page);
    }
  };

  const pageTitle = config ? config.title : 'Filmes';

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-6 md:px-12 py-24">
        
        {/* Cabeçalho da página */}
        <div className="mb-12">
            <Link to="/" className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-colors w-max mb-4">
                <FaArrowLeft />
                <span>Voltar para o Início</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">{pageTitle}</h1>
        </div>

        {/* Grade de Filmes */}
        <div>
          {isLoading ? (
            <p className="text-center text-lg">Carregando filmes...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">{error}</p>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                {movies.map((movie) => (
                  <MovieCard key={`${movie.id}-${Math.random()}`} movie={movie} />
                ))}
              </div>

              {/* ✅ Botão para carregar mais filmes */}
              {page <= totalPages && (
                <div className="text-center mt-12">
                  <button 
                    onClick={handleLoadMore} 
                    disabled={isFetchingMore}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isFetchingMore ? 'Carregando...' : 'Carregar mais'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-lg text-gray-500">Nenhum filme encontrado nesta categoria.</p>
          )}
        </div>
      </div>
    </div>
  );
}