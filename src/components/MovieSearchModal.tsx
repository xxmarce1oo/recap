// arquivo: src/components/MovieSearchModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { Movie } from '../models/movie';
import { searchMovies } from '../services/tmdbService';
import Fuse from 'fuse.js';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieSearchModal({ isOpen, onClose, onMovieSelect }: Props) {
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState<Movie[]>([]);
  const [filteredResults, setFilteredResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fuseOptions = {
    includeScore: true,
    threshold: 0.4,
    distance: 100,
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'original_title', weight: 0.5 },
    ]
  };

  // Efeito para buscar na API (debounced)
  useEffect(() => {
    if (query.trim().length < 2) {
      setApiResults([]);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      searchMovies(query).then(data => {
        // ✅ FILTRO ADICIONADO AQUI:
        // Removemos todos os filmes que não possuem um `poster_path`.
        const moviesWithPosters = data.results.filter(movie => movie.poster_path);
        setApiResults(moviesWithPosters);
        setIsLoading(false);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Efeito para filtrar e ordenar com Fuse.js
  useEffect(() => {
    if (query.trim().length > 0 && apiResults.length > 0) {
      const fuse = new Fuse(apiResults, fuseOptions);
      const fuseResults = fuse.search(query);

      const rankedMovies = fuseResults
        .map(result => {
          const textScore = result.score ?? 1;
          const popularityScore = 1 / Math.log10(result.item.popularity + 10);
          const finalScore = (textScore * 0.7) + (popularityScore * 0.3);
          return { ...result, finalScore };
        })
        .sort((a, b) => a.finalScore - b.finalScore)
        .map(result => result.item);
      
      setFilteredResults(rankedMovies);
    } else {
      setFilteredResults([]);
    }
  }, [apiResults, query]);

  // Limpa o estado quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery('');
        setApiResults([]);
        setFilteredResults([]);
      }, 300);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex w-screen items-start justify-center p-4 pt-[10vh]">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-gray-800 text-white shadow-2xl">
          
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Comece a digitar para buscar um filme..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                autoComplete="off"
                autoFocus
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <FaSearch className="text-gray-400" />
              </span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4 border-t border-gray-700">
            {isLoading && <p className="text-center text-gray-400">Buscando...</p>}
            <div className="space-y-2">
              {!isLoading && filteredResults.length > 0 && (
                filteredResults.map((movie) => (
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
              {!isLoading && filteredResults.length === 0 && query && (
                <p className="text-center text-gray-500">Nenhum resultado encontrado para "{query}".</p>
              )}
            </div>
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}