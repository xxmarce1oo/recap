// arquivo: src/components/WatchlistPreview.tsx

import { Link } from 'react-router-dom';
import { Movie } from '../models/movie';

interface Props {
  movies: Movie[];
  totalCount: number;
}

export default function WatchlistPreview({ movies, totalCount }: Props) {
  if (totalCount === 0) {
    return null; // Não exibe a seção se a watchlist estiver vazia
  }

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex justify-between items-baseline mb-3">
        <Link to="/watchlist" className="text-xs uppercase tracking-wider text-gray-400 hover:text-white transition-colors font-semibold">
          Watchlist
        </Link>
        <span className="text-xs text-gray-500">{totalCount}</span>
      </div>
      
      {/* Grid para os pôsteres */}
      <div className="grid grid-cols-5 gap-2">
        {movies.map((movie) => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="block group">
            <div className="aspect-[2/3] w-full bg-gray-700 rounded-md overflow-hidden relative">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}