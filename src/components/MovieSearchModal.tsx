// arquivo: src/components/MovieSearchModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Movie } from '../models/movie';
import { searchMovies } from '../services/tmdbService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieSearchModal({ isOpen, onClose, onMovieSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ NOVO useEffect PARA BUSCA AUTOMÁTICA
  useEffect(() => {
    // Se a busca estiver vazia, limpa os resultados e não faz nada.
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Cria um "timer" para aguardar o usuário parar de digitar.
    const delayDebounceFn = setTimeout(() => {
      searchMovies(query).then(data => {
        setResults(data.results);
        setIsLoading(false);
      });
    }, 500); // Aguarda 500ms (meio segundo) antes de buscar.

    // Função de limpeza: se o usuário digitar novamente, o timer anterior é cancelado.
    return () => clearTimeout(delayDebounceFn);

  }, [query]); // Este efeito roda toda vez que a 'query' (texto da busca) muda.


  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery('');
        setResults([]);
      }, 300);
    }
  }, [isOpen]);

  // A função handleSearch e o <form> não são mais necessários, mas podemos mantê-los
  // caso o usuário queira buscar apertando Enter.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchMovies(query).then(data => {
        setResults(data.results);
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex w-screen items-start justify-center p-4 pt-[10vh]">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-gray-800 text-white shadow-2xl">
          
          <div className="p-4">
            <form onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Comece a digitar para buscar um filme..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </span>
            </form>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4 border-t border-gray-700">
            {isLoading && <p className="text-center text-gray-400">Buscando...</p>}
            <div className="space-y-2">
              {!isLoading && results.length > 0 && (
                results.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => onMovieSelect(movie)}
                    className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-gray-700 text-left transition-colors"
                  >
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/50x75?text=Recap'}
                      alt={movie.title}
                      className="w-12 rounded flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold">{movie.title}</p>
                      <p className="text-sm text-gray-400">{movie.release_date?.substring(0, 4)}</p>
                    </div>
                  </button>
                ))
              )}
              {!isLoading && results.length === 0 && query && (
                <p className="text-center text-gray-500">Nenhum resultado encontrado para "{query}".</p>
              )}
            </div>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}