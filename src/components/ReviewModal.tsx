// arquivo: src/components/ReviewModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, FormEvent } from 'react';
import { Movie } from '../models/movie';
import { FaHeart, FaRegHeart, FaStar, FaTimes } from 'react-icons/fa';
import { IoIosImages } from 'react-icons/io';
import { format } from 'date-fns';

// ✅ 1. A interface de props foi definida corretamente para incluir tudo o que o modal precisa.
interface Props {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  posters: any[];
  currentPosterPath: string;
  onChangePoster: () => void;
}

// ✅ 2. As props agora são recebidas corretamente na definição do componente.
export default function ReviewModal({ isOpen, onClose, movie, posters, currentPosterPath, onChangePoster }: Props) {
  if (!movie) return null;

  // O resto da lógica do componente continua a mesma.
  const [watchedOn, setWatchedOn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isFirstWatch, setIsFirstWatch] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [tags, setTags] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({
      movieId: movie.id,
      watchedOn,
      isRewatch: !isFirstWatch,
      reviewText,
      tags: tags.split(',').map(tag => tag.trim()),
      rating,
      isLiked,
    });
    alert('Review salva com sucesso! (simulação)');
    onClose();
  };
  
  // ✅ 3. A variável 'imageUrl' agora consegue encontrar 'currentPosterPath' sem erros.
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
              <Dialog.Title className="text-xl font-bold">Eu assisti...</Dialog.Title>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 flex-shrink-0 relative">
                <img src={imageUrl} alt={movie.title} className="w-full rounded-lg shadow-lg" />
                {posters.length > 1 && (
                  <button 
                    type="button"
                    onClick={onChangePoster}
                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                    aria-label="Trocar pôster"
                  >
                    <IoIosImages size={20} />
                  </button>
                )}
              </div>
              <div className="w-full space-y-4">
                <h2 className="text-3xl font-bold">{movie.title} <span className="font-light text-gray-400">{movie.release_date.substring(0, 4)}</span></h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="watchedOnCheck" checked={isFirstWatch} onChange={() => setIsFirstWatch(true)} className="rounded text-cyan-500 focus:ring-cyan-500" />
                    <label htmlFor="watchedOnCheck">Assistido em</label>
                    <input type="date" value={watchedOn} onChange={e => setWatchedOn(e.target.value)} className="bg-gray-700 p-1 rounded-md text-xs"/>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="rewatchCheck" checked={!isFirstWatch} onChange={() => setIsFirstWatch(false)} className="rounded text-cyan-500 focus:ring-cyan-500"/>
                    <label htmlFor="rewatchCheck">Já tinha assistido antes</label>
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={8}
                  placeholder="Adicione uma crítica..."
                  className="w-full p-3 bg-gray-700/50 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <div>
                    <label className="text-sm font-semibold">Tags</label>
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="ex: netflix, alien, suspense" className="w-full mt-1 p-2 bg-gray-700/50 rounded-md border border-gray-600 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"/>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-b-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLiked(!isLiked)}>
                  {isLiked ? <FaHeart className="text-red-500" size={24}/> : <FaRegHeart className="text-gray-400 hover:text-white" size={24}/>}
                  <span className="font-semibold text-sm">Like</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    return <FaStar key={starValue} size={24} className="cursor-pointer" color={starValue <= (hoverRating || rating) ? '#ffc107' : '#6b7280'} onClick={() => setRating(starValue)} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)} />;
                  })}
                </div>
              </div>
              <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                SALVAR
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}