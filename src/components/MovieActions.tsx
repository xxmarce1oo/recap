// arquivo: src/components/MovieActions.tsx
import { useState } from 'react'; 
import { FaRegEye, FaHeart, FaRegHeart, FaRegClock, FaStar, FaEye, FaClock } from 'react-icons/fa';

interface Props {
  onReviewClick: () => void;
  // Props para a watchlist
  isInWatchlist: boolean;
  onWatchlistClick: () => void;
  isWatchlistLoading: boolean; // Para desabilitar o botão enquanto carrega
  isAuth: boolean;
}

export default function MovieActions({ 
    onReviewClick, 
    isInWatchlist, 
    onWatchlistClick, 
    isWatchlistLoading,
    isAuth 
}: Props) {
  
  // Ações de Like e Rating (ainda como exemplo)
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const handleLike = () => setIsLiked(!isLiked);

  return (
    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-5">
          {/* Ação de Assistido (exemplo) */}
          <div className={`flex flex-col items-center space-y-1 text-gray-400 cursor-pointer`}>
            <FaRegEye size={22} />
            <span className="text-xs font-semibold">Assistido</span>
          </div>

          {/* Ação de Like (exemplo) */}
          <div onClick={handleLike} className={`flex flex-col items-center space-y-1 cursor-pointer transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
            {isLiked ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
            <span className="text-xs font-semibold">Like</span>
          </div>

          {/* Botão Watchlist Funcional */}
          <div 
            onClick={!isAuth || isWatchlistLoading ? undefined : onWatchlistClick}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              !isAuth || isWatchlistLoading 
                ? 'text-gray-600 cursor-not-allowed' 
                : isInWatchlist 
                  ? 'text-cyan-400 cursor-pointer' 
                  : 'text-gray-400 hover:text-white cursor-pointer'
            }`}
            title={!isAuth ? "Você precisa estar logado" : (isInWatchlist ? "Remover da Watchlist" : "Adicionar à Watchlist")}
          >
            {isInWatchlist ? <FaClock size={22} /> : <FaRegClock size={22} />}
            <span className="text-xs font-semibold">Watchlist</span>
          </div>
        </div>

        <div className="h-12 w-px bg-gray-700"></div>

        {/* Avaliação (exemplo) */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return <FaStar key={starValue} size={28} className="cursor-pointer" color={starValue <= (hoverRating || rating) ? '#06b6d4' : '#6b7280'} onClick={() => setRating(starValue)} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)} />;
          })}
        </div>
      </div>

      <div>
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