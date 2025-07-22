// arquivo: src/components/DiaryGridItem.tsx

import { Link } from 'react-router-dom';
import { FaEye, FaHeart } from 'react-icons/fa';
import { EnrichedLog } from '../services/logService';
import StarRatingDisplay from './StarRatingDisplay';

interface Props {
  log: EnrichedLog;
}

export default function DiaryGridItem({ log }: Props) {
  const { movie, rating, is_liked, poster_path } = log;
  const displayPoster = poster_path || movie.poster_path;

  return (
    <div className="relative aspect-[2/3] w-full group">
      <Link to={`/movie/${movie.id}`}>
        <img
          src={`https://image.tmdb.org/t/p/w500${displayPoster}`}
          alt={movie.title}
          className="w-full h-full object-cover rounded-lg shadow-md"
        />
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
            <div className="flex items-center gap-1.5">
              <StarRatingDisplay rating={rating} size={14} />
              <span className="text-xs font-bold text-gray-300">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}