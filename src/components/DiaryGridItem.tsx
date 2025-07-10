// ficheiro: src/components/DiaryGridItem.tsx

import { Link } from 'react-router-dom';
import { FaEye, FaHeart, FaStar } from 'react-icons/fa';
import { EnrichedLog } from '../services/logService';

interface Props {
  log: EnrichedLog;
}

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex text-yellow-400">
      {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} />)}
      {/* Nota: A lógica para meia estrela pode ser adicionada aqui se necessário */}
      {[...Array(emptyStars)].map((_, i) => <FaStar key={`empty-${i}`} className="text-gray-600" />)}
    </div>
  );
};


export default function DiaryGridItem({ log }: Props) {
  const { movie, rating, is_liked } = log;

  return (
    <div className="relative aspect-[2/3] w-full group">
      <Link to={`/movie/${movie.id}`}>
        {/* Imagem do Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-full object-cover rounded-lg shadow-md"
        />

        {/* Overlay que aparece ao passar o rato */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 text-white">
          <div className="space-y-2">
            <h3 className="font-bold text-sm leading-tight">{movie.title}</h3>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <FaEye />
                <span>{movie.release_date.substring(0, 4)}</span>
              </span>
              {is_liked && <FaHeart className="text-red-500" />}
            </div>
            <StarRating rating={rating} />
          </div>
        </div>
      </Link>
    </div>
  );
}