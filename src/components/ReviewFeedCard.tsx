// ficheiro: src/components/ReviewFeedCard.tsx

import { Link } from 'react-router-dom';
import { FaHeart, FaStar, FaSyncAlt, FaCommentAlt, FaShareSquare } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnrichedLog } from '../services/logService';

interface Props {
  log: EnrichedLog;
  username: string;
  userAvatarUrl?: string;
}

export default function ReviewFeedCard({ log, username, userAvatarUrl }: Props) {
  const { movie, watched_date, rating, review_text, is_liked, is_rewatch } = log;
  
  const formattedDate = format(parseISO(watched_date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="bg-gray-800/50 rounded-lg shadow-lg flex gap-4 p-4">
      {/* Coluna do Poster */}
      <div className="w-40 flex-shrink-0">
        <Link to={`/movie/${movie.id}`}>
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full rounded-md transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Coluna de Detalhes da Review */}
      <div className="flex-grow flex flex-col">
        <div className="flex items-baseline gap-3 mb-1">
            <h3 className="text-2xl font-bold">
            <Link to={`/movie/${movie.id}`} className="hover:text-cyan-400">
                {movie.title}
            </Link>
            </h3>
            <span className="text-xl font-light text-gray-400">
                {movie.release_date.substring(0, 4)}
            </span>
            {is_rewatch && <FaSyncAlt className="text-cyan-400" title="Rewatch" />}
        </div>
        
        <p className="text-sm text-gray-400 mb-3">
            Assistido por <span className="font-bold text-white">{username}</span> em {formattedDate}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1 text-lg">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < rating ? 'text-cyan-500' : 'text-gray-600'} />
            ))}
          </span>
          {is_liked && <FaHeart className="text-red-500 text-xl" />}
        </div>

        {review_text && (
          <blockquote className="prose prose-invert text-gray-300 text-sm max-w-none mb-4">
            <p>{review_text}</p>
          </blockquote>
        )}

        {/* Footer com Ações Sociais (preparado para o futuro) */}
        <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center gap-6 text-gray-500">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
                <FaHeart /> 
                <span>Curtir</span>
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
                <FaCommentAlt />
                <span>Comentar</span>
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
                <FaShareSquare />
                <span>Compartilhar</span>
            </button>
        </div>
      </div>
    </div>
  );
}