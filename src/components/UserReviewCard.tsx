// arquivo: src/components/UserReviewCard.tsx

import { Link } from 'react-router-dom';
import { FaHeart, FaSyncAlt } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnrichedLog } from '../services/logService';
import StarRatingDisplay from './StarRatingDisplay';

interface Props {
  log: EnrichedLog;
}

export default function UserReviewCard({ log }: Props) {
  const { watched_date, rating, review_text, is_liked, is_rewatch } = log;
  
  const formattedDate = format(parseISO(watched_date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Link to={`/log/${log.id}`} className="block bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-400">
          Você assistiu em <span className="font-semibold text-gray-300">{formattedDate}</span>
        </p>
        <div className="flex items-center gap-3 text-cyan-400">
          {is_rewatch && <FaSyncAlt title="Rewatch" />}
          {is_liked && <FaHeart className="text-red-500" title="Gostei" />}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StarRatingDisplay rating={rating} size={20} />
        {/* ✅ NOTA NUMÉRICA ADICIONADA AQUI */}
        <span className="text-sm font-bold text-gray-300 pt-px">{rating.toFixed(1)}</span>
      </div>

      {review_text && (
        <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none">
          <p>{review_text}</p>
        </blockquote>
      )}
    </Link>
  );
}