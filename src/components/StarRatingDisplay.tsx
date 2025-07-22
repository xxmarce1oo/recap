// arquivo: src/components/StarRatingDisplay.tsx

import { FaStar } from 'react-icons/fa';

interface Props {
  rating: number;
  size?: number;
  className?: string;
}

export default function StarRatingDisplay({ rating, size = 16, className = '' }: Props) {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        // Calcula a porcentagem de preenchimento para cada estrela
        const fillPercentage = Math.min(1, Math.max(0, rating - index)) * 100;

        return (
          <div key={index} className="relative" style={{ fontSize: size }}>
            {/* Estrela de fundo (vazia) */}
            <FaStar className="text-gray-600" />
            {/* Estrela de preenchimento por cima, com largura dinâmica */}
            <div
              className="absolute top-0 left-0 h-full overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <FaStar className="text-yellow-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
}