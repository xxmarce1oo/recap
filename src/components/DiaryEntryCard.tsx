// arquivo: src/components/DiaryEntryCard.tsx

import { Link } from 'react-router-dom';
import { FaHeart, FaStar, FaSyncAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnrichedLog } from '../services/logService';

interface Props {
  log: EnrichedLog;
}

export default function DiaryEntryCard({ log }: Props) {
  const { movie, watched_date, rating, review_text, is_liked, is_rewatch } = log;
  
  const formattedDate = format(parseISO(watched_date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="flex gap-4 border-b border-gray-800 py-4">
      <div className="w-32 flex-shrink-0">
        <Link to={`/movie/${movie.id}`}>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full rounded-md shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex-grow">
        <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-xl font-bold">
            <Link to={`/movie/${movie.id}`} className="hover:text-cyan-400">
                {movie.title}
            </Link>
            </h3>
            <span className="text-lg font-light text-gray-400">
                {movie.release_date.substring(0, 4)}
            </span>
            {is_rewatch && <FaSyncAlt className="text-cyan-400" title="Rewatch" />}
        </div>
        
        <p className="text-sm text-gray-500 mb-2">Assistido em {formattedDate}</p>

        <div className="flex items-center gap-4 mb-3">
          <span className="flex items-center gap-1 text-lg">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < rating ? 'text-cyan-500' : 'text-gray-600'} />
            ))}
          </span>
          {is_liked && <FaHeart className="text-red-500" />}
        </div>

        {review_text && (
          <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none">
            <p>{review_text}</p>
          </blockquote>
        )}
      </div>
    </div>
  );
}