// arquivo: src/components/InlineReviewForm.tsx

import { useState, FormEvent, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveLog, getLogCountForMovie } from '../services/reviewService';
import StarRatingInput from './StarRatingInput';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface Props {
  movieId: number;
  onReviewSaved: () => void;
}

export default function InlineReviewForm({ movieId, onReviewSaved }: Props) {
  const { user } = useAuth();

  const [watchedOn, setWatchedOn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isRewatch, setIsRewatch] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForRewatch = useCallback(async () => {
    if (!user) return;
    try {
      const logCount = await getLogCountForMovie(user.id, movieId);
      setIsRewatch(logCount > 0);
    } catch (err) {
      console.error("Não foi possível verificar o histórico de rewatch.");
    }
  }, [user, movieId]);

  useEffect(() => {
    checkForRewatch();
  }, [checkForRewatch]);

  const resetForm = () => {
    setRating(0);
    setReviewText('');
    setIsLiked(false);
    setError(null);
    setWatchedOn(format(new Date(), 'yyyy-MM-dd'));
    checkForRewatch(); // Re-verifica o status de rewatch
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return setError("Você precisa estar logado para salvar uma review.");
    if (rating === 0) return setError("É necessário dar uma nota para salvar.");
    
    setLoading(true);
    setError(null);
    try {
      await saveLog({
        userId: user.id,
        movieId: movieId,
        rating,
        reviewText,
        isLiked,
        watchedDate: watchedOn,
        isRewatch,
        posterPath: null, // Aqui você pode adicionar lógica para pegar o caminho do pôster se necessário
      });
      alert('Review salva com sucesso no seu diário!');
      resetForm();
      onReviewSaved(); // Avisa a página pai para atualizar a lista de reviews
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar a review.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">
        {/* <p>Você precisa estar <Link to="/" className="text-cyan-400 hover:underline">logado</Link> para registrar este filme.</p> */}
        <p>Você precisa estar <Link to="/" className="text-cyan-400 hover:underline">logado</Link> para registrar este filme.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg">
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={3}
        placeholder={`Adicione uma crítica... ${isRewatch ? '(Rewatch)' : ''}`}
        className="w-full p-3 bg-gray-700/50 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
      />
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <StarRatingInput rating={rating} onRatingChange={setRating} />
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
            {isLiked ? <FaHeart className="text-red-500" size={24}/> : <FaRegHeart className="text-gray-400 hover:text-white" size={24}/>}
          </div>
           <div className="flex items-center gap-2">
              <label htmlFor="watchedOn" className="text-xs text-gray-400">Assistido em</label>
              <input type="date" id="watchedOn" value={watchedOn} onChange={e => setWatchedOn(e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs"/>
          </div>
        </div>
        <div className="flex items-center">
          {error && <p className="text-sm text-red-400 text-center mr-4">{error}</p>}
          <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </form>
  );
}