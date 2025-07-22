// arquivo: src/components/StarRatingInput.tsx

import React, { useState, useRef } from 'react';
import { FaStar, FaTimesCircle } from 'react-icons/fa';

interface Props {
  rating: number;
  onRatingChange: (newRating: number) => void;
}

// Subcomponente de exibição visual, permanece o mesmo
const StarDisplay = ({ rating, size = 28 }: { rating: number, size?: number }) => {
  return (
    <div className="flex items-center text-yellow-400" style={{ fontSize: size }}>
      {[...Array(5)].map((_, index) => {
        const fillPercentage = Math.min(1, Math.max(0, rating - index)) * 100;
        return (
          <div key={index} className="relative">
            <FaStar className="text-gray-600" />
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <FaStar />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function StarRatingInput({ rating, onRatingChange }: Props) {
  const [hoverRating, setHoverRating] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ LÓGICA SIMPLIFICADA E CORRIGIDA
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const rawRating = (x / width) * 5;
    // Arredonda para a casa decimal mais próxima (ex: 3.67 -> 3.7)
    const preciseRating = Math.max(0.1, Math.ceil(rawRating * 10) / 10);
    setHoverRating(Math.min(5, preciseRating)); // Garante que não passe de 5
  };

  const handleMouseLeave = () => {
    setHoverRating(0); // Limpa o hover ao sair da área
  };

  const handleClick = () => {
    // Define a nota com base na última posição do hover
    onRatingChange(hoverRating);
  };

  const displayValue = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-3">
      <div
        ref={containerRef}
        className="flex cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <StarDisplay rating={displayValue} />
      </div>
      <div className="relative w-16 text-center">
        <span className="text-lg font-bold text-gray-300">
          {displayValue > 0 ? displayValue.toFixed(1) : '-'}
        </span>
        {rating > 0 && (
          <button
            type="button"
            onClick={() => onRatingChange(0)}
            className="absolute -right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            title="Limpar nota"
          >
            <FaTimesCircle />
          </button>
        )}
      </div>
    </div>
  );
}