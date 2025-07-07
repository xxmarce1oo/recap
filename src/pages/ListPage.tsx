// arquivo: src/pages/ListPage.tsx

import { useState, useEffect } from 'react';
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
  // Pega o tipo de lista da URL (ex: 'now_playing' ou 'top_rated')
  const { listType } = useParams<{ listType: ListType }>();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = listType ? listConfig[listType] : null;

  useEffect(() => {
    if (!config) {
        setError('Categoria de lista inválida.');
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    config.fetcher()
      .then(data => {
        setMovies(data.results);
      })
      .catch(err => {
        console.error(err);
        setError('Não foi possível carregar os filmes.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [listType, config]); // Re-executa quando o tipo de lista ou a config mudam

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-center text-lg text-gray-500">Nenhum filme encontrado nesta categoria.</p>
          )}
        </div>
      </div>
    </div>
  );
}