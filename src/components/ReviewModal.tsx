// arquivo: src/components/ReviewModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import { Movie } from '../models/movie';
import { FaHeart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar, FaTimes } from 'react-icons/fa';
import { IoIosImages } from 'react-icons/io';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { saveLog, getLogCountForMovie } from '../services/reviewService';
import StarRatingDisplay from './StarRatingDisplay'; // Componente para exibir a nota com estrelas

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void; // Propriedade necessária
  movie: Movie | null;
  posters: any[];
  currentPosterPath: string;
  onChangePoster: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSaveSuccess,
  movie,
  posters,
  currentPosterPath,
  onChangePoster
}: Props) {
  const { user } = useAuth();

  const [watchedOn, setWatchedOn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isRewatch, setIsRewatch] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForRewatch = useCallback(async () => {
    if (!isOpen || !user || !movie) return;
    setLoading(true);
    try {
      const logCount = await getLogCountForMovie(user.id, movie.id);
      setIsRewatch(logCount > 0);
    } catch (err) {
      setError("Não foi possível verificar o seu histórico.");
    } finally {
      setLoading(false);
    }
  }, [isOpen, user, movie]);

  useEffect(() => {
    checkForRewatch();
  }, [checkForRewatch]);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setReviewText('');
      setIsLiked(false);
      setError(null);
      setWatchedOn(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !movie) return;

    if (rating === 0) {
      setError("É necessário dar uma nota para salvar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveLog({
        userId: user.id,
        movieId: movie.id,
        rating,
        reviewText,
        isLiked,
        watchedDate: watchedOn,
        isRewatch,
        posterPath: currentPosterPath || null, // Passa o caminho do pôster
      });
      alert('Log salvo com sucesso no seu diário!');
      onSaveSuccess(); // Chamando a função de sucesso
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // ✅ Nova função para calcular a nota precisa baseada na posição do mouse
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const rawRating = (x / width) * 5;
    // Arredonda para o 0.1 mais próximo (ex: 3.67 -> 3.7)
    const preciseRating = Math.max(0.1, Math.ceil(rawRating * 10) / 10);
    setHoverRating(Math.min(5, preciseRating)); // Garante que não passe de 5
  };

  if (!movie) return null;

  const imageUrl = currentPosterPath
    ? `https://image.tmdb.org/t/p/w500${currentPosterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-gray-800 text-white shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <Dialog.Title className="text-xl font-bold">Adicionar ao Diário</Dialog.Title>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center">A verificar...</div>
            ) : (
              <>
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3 flex-shrink-0 relative">
                    <img src={imageUrl} alt={movie.title} className="w-full rounded-lg shadow-lg" />
                    {posters.length > 1 && (
                      <button type="button" onClick={onChangePoster} className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors" aria-label="Trocar pôster">
                        <IoIosImages size={20} />
                      </button>
                    )}
                  </div>
                  <div className="w-full space-y-4">
                    <h2 className="text-3xl font-bold">{movie.title} <span className="font-light text-gray-400">{movie.release_date.substring(0, 4)}</span></h2>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <label htmlFor="watchedOn">Assistido em</label>
                        <input type="date" id="watchedOn" value={watchedOn} onChange={e => setWatchedOn(e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs" />
                      </div>
                      {isRewatch && <span className="bg-cyan-800/50 text-cyan-300 text-xs font-bold px-2 py-1 rounded">REWATCH</span>}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={8}
                      placeholder="Adicione uma crítica ou notas para esta visualização..."
                      className="w-full p-3 bg-gray-700/50 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-b-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
                      {isLiked ? <FaHeart className="text-red-500" size={24} /> : <FaRegHeart className="text-gray-400 hover:text-white" size={24} />}
                      <span className="font-semibold text-sm">Like</span>
                    </div>

                    {/* ✅ Lógica de input de nota precisa */}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex cursor-pointer"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(hoverRating)}
                      >
                        <StarRatingDisplay rating={hoverRating || rating} size={28} />
                      </div>
                      <span className="text-sm font-bold text-gray-400 w-8">
                        {(hoverRating || rating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {error && <p className="text-sm text-red-400 text-center mr-4">{error}</p>}
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-600">
                      {loading ? 'SALVANDO...' : 'SALVAR'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}