// arquivo: src/components/DiaryEntryCard.tsx

import { Link } from 'react-router-dom';
import { FaHeart, FaSyncAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnrichedLog } from '../services/logService';
import StarRatingDisplay from './StarRatingDisplay';

interface Props {
  log: EnrichedLog;
}

export default function DiaryEntryCard({ log }: Props) {
  const { movie, watched_date, rating, review_text, is_liked, is_rewatch, id: logId, poster_path } = log;
  
  const displayPoster = poster_path || movie.poster_path;
  const formattedDate = format(parseISO(watched_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-gray-800/80 p-4 rounded-lg transition-colors border border-transparent hover:border-gray-700">
      <div className="flex gap-4">
        <div className="w-32 flex-shrink-0">
          <Link to={`/movie/${movie.id}`} className="block">
            <img
              src={`https://image.tmdb.org/t/p/w500${displayPoster}`}
              alt={movie.title}
              className="w-full rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>
        <div className="flex-grow">
          <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-xl font-bold">
              <Link to={`/log/${logId}`} className="hover:text-cyan-400">
                  {movie.title}
              </Link>
            </h3>
            <span className="text-lg font-light text-gray-400">
                {movie.release_date.substring(0, 4)}
            </span>
            {is_rewatch && <FaSyncAlt className="text-cyan-400" title="Rewatch" />}
          </div>
          
          <p className="text-sm text-gray-500 mb-2">Assistido em {formattedDate}</p>

          <div className="flex items-center gap-2 mb-3">
            <StarRatingDisplay rating={rating} size={20} />
            <span className="text-sm font-bold text-gray-300 pt-px">{rating.toFixed(1)}</span>
            {is_liked && <FaHeart className="text-red-500 ml-2" />}
          </div>

          {review_text && (
            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 leading-relaxed prose prose-invert max-w-none line-clamp-3">
              <p>{review_text}</p>
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
}