// arquivo: src/components/MovieCard.tsx

import { Link } from 'react-router-dom';
import { Movie } from '../models/movie';

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    // ✅ Card responsivo: tamanhos otimizados para caber na tela sem scroll
    <div className="w-24 sm:w-32 md:w-40 lg:w-48 space-y-2">
      <Link to={`/movie/${movie.id}`} className="block group">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-36 sm:h-48 md:h-60 lg:h-72 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
        </div>
      </Link>
      
      <div className="text-center">
        <Link to={`/movie/${movie.id}`} className="hover:text-cyan-400 transition-colors">
            <h3 className="text-xs font-bold truncate leading-tight">{movie.title}</h3>
        </Link>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-1">
          <span className="text-xs">{movie.release_date.substring(0, 4)}</span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}