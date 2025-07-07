// arquivo: src/components/FavoriteMovieSlot.tsx

import { Movie } from '../models/movie';
import { FaPlus } from 'react-icons/fa';

interface Props {
  movie: Movie | null;
  onSelectSlot: () => void;
}

export default function FavoriteMovieSlot({ movie, onSelectSlot }: Props) {
  return (
    <div className="aspect-[2/3] w-full relative group">
      {movie ? (
        // --- Slot Preenchido ---
        <>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
          <div 
            onClick={onSelectSlot}
            className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
          >
            <span className="text-center text-sm font-bold">Alterar</span>
          </div>
        </>
      ) : (
        // --- Slot Vazio ---
        <div
          onClick={onSelectSlot}
          className="w-full h-full bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-700 hover:border-cyan-500 transition-colors cursor-pointer"
        >
          <FaPlus className="text-gray-600 group-hover:text-cyan-500" size={24} />
        </div>
      )}
    </div>
  );
}