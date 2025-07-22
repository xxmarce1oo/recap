// arquivo: src/components/FavoriteMovieSlot.tsx

import { Movie } from '../models/movie';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';

interface Props {
  movie: Movie | null;
  posterPath?: string | null; // Recebe o caminho do pôster customizado
  onSelectSlot: () => void;
  onEditPoster: () => void; // Função para abrir o modal de edição
}

export default function FavoriteMovieSlot({ movie, posterPath, onSelectSlot, onEditPoster }: Props) {
  // Usa o pôster customizado se existir, senão usa o padrão do filme
  const displayPoster = posterPath || movie?.poster_path;

  return (
    <div className="aspect-[2/3] w-full relative group">
      {movie ? (
        <>
          <img
            src={`https://image.tmdb.org/t/p/w500${displayPoster}`}
            alt={movie.title}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
          <div 
            onClick={onSelectSlot}
            className="absolute inset-0 bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
          >
            <span className="text-center text-sm font-bold">Alterar Filme</span>
          </div>
          {/* Botão de editar pôster */}
          <button
            onClick={onEditPoster}
            className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 hover:bg-cyan-600 transition-all"
            title="Alterar Pôster"
          >
            <FaPencilAlt size={12} />
          </button>
        </>
      ) : (
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