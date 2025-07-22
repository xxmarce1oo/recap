// arquivo: src/pages/LogDetailsPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEnrichedLogById, EnrichedLog } from '../services/logService';
import DiaryEntryCard from '../components/DiaryEntryCard';
import { FaHeart, FaRegHeart, FaCommentAlt } from 'react-icons/fa';

export default function LogDetailsPage() {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<EnrichedLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Futuramente, estes estados controlarão as interações
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!logId) return;
    setIsLoading(true);
    getEnrichedLogById(Number(logId))
      .then(data => {
        if (data) {
          setLog(data);
        } else {
          setError('Review não encontrada.');
        }
      })
      .catch(() => setError('Ocorreu um erro ao buscar a review.'))
      .finally(() => setIsLoading(false));
  }, [logId]);

  if (isLoading) {
    return <div className="text-center py-24">Carregando review...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  if (!log) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      {/* O componente DiaryEntryCard exibe a review principal */}
      <DiaryEntryCard log={log} />

      {/* Seção de Interações (placeholder funcional) */}
      <div className="mt-6 flex items-center gap-6 border-t border-gray-800 pt-4">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span className="font-semibold text-sm">{likeCount + (isLiked ? 1 : 0)} Curtidas</span>
        </button>
        <div className="flex items-center gap-2 text-gray-400">
          <FaCommentAlt />
          <span className="font-semibold text-sm">0 Comentários</span>
        </div>
      </div>

      {/* Seção de Comentários (placeholder visual) */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-4">Comentários</h3>
        <textarea
          rows={3}
          placeholder="Escreva um comentário..."
          className="w-full p-3 bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="text-right mt-2">
            <button className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-colors">
                Comentar
            </button>
        </div>
        <p className="text-center text-gray-500 mt-8 text-sm">Ainda não há comentários.</p>
      </div>
    </div>
  );
}