// arquivo: src/components/MovieActions.tsx

import { useState } from 'react';
import { FaRegEye, FaHeart, FaRegHeart, FaRegClock, FaStar, FaEye } from 'react-icons/fa';

// ✅ 1. A interface de props foi atualizada
interface Props {
  onReviewClick: () => void;
}

export default function MovieActions({ onReviewClick }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  // ✅ 2. Novo estado para controlar o status "assistido"
  const [isWatched, setIsWatched] = useState(false);

  const handleLike = () => setIsLiked(!isLiked);
  const handleWatch = () => setIsWatched(!isWatched);

  const Star = ({ value }: { value: number }) => (
    <FaStar
      key={value}
      size={28}
      className="cursor-pointer"
      color={value <= (hoverRating || rating) ? '#06b6d4' : '#6b7280'}
      onClick={() => setRating(value)}
      onMouseEnter={() => setHoverRating(value)}
      onMouseLeave={() => setHoverRating(0)}
    />
  );

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
      
      {/* Lado Esquerdo: Ações rápidas e Avaliação */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-5">
          {/* ✅ 3. O botão "Assistido" agora usa o novo estado e muda de cor */}
          <div 
            onClick={handleWatch}
            className={`flex flex-col items-center space-y-1 cursor-pointer transition-colors ${
              isWatched ? 'text-green-400' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isWatched ? <FaEye size={22} /> : <FaRegEye size={22} />}
            <span className="text-xs font-semibold">Assistido</span>
          </div>

          <div 
            onClick={handleLike}
            className={`flex flex-col items-center space-y-1 cursor-pointer transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isLiked ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
            <span className="text-xs font-semibold">Like</span>
          </div>
          <div className="flex flex-col items-center space-y-1 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <FaRegClock size={22} />
            <span className="text-xs font-semibold">Watchlist</span>
          </div>
        </div>

        <div className="h-12 w-px bg-gray-700"></div>

        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => <Star key={index} value={index + 1} />)}
        </div>
      </div>

      {/* Lado Direito: Botão para Escrever Review */}
      <div>
        {/* ✅ 4. Novo botão verde "REVIEW" que chama a função recebida por prop */}
        <button 
          onClick={onReviewClick}
          className="bg-green-600 text-white font-bold text-sm px-5 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          REVIEW
        </button>
      </div>
    </div>
  );
}