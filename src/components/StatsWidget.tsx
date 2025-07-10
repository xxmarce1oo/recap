// ficheiro: src/components/StatsWidget.tsx

import { RatingsDistribution } from '../services/statsService';
import { FaStar } from 'react-icons/fa';

interface Props {
  reviewCount: number;
  distribution: RatingsDistribution;
}

const RATING_LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function StatsWidget({ reviewCount, distribution }: Props) {
  const maxCountLog = Math.log(Math.max(1, ...Object.values(distribution)) + 1);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex items-center text-xs uppercase tracking-wider text-gray-400 mb-3">
        <span className="font-semibold">Ratings</span>
        <span className="flex-grow border-b border-gray-700/70 mx-3"></span>
        <span>{reviewCount}</span>
      </div>
      
      {reviewCount > 0 ? (
        <div className="flex items-end gap-3">
          <FaStar className="text-cyan-500 flex-shrink-0 mb-px" size={14} />
          <div className="flex items-end justify-between w-full h-20 gap-px">
            {RATING_LEVELS.map(rating => {
              const count = distribution[rating] || 0;
              const heightPercentage = count > 0 ? (Math.log(count + 1) / maxCountLog) * 100 : 0;

              return (
                <div
                  key={rating}
                  className="flex-1 bg-gray-600 hover:bg-cyan-400 rounded-t-sm transition-all duration-200"
                  style={{ minHeight: '2px', height: `${heightPercentage}%` }}
                  title={`${count} filme(s) com nota ${rating}`}
                />
              );
            })}
          </div>
          <div className="flex flex-shrink-0 text-cyan-500 mb-px">
            <FaStar size={14} /><FaStar size={14} /><FaStar size={14} /><FaStar size={14} /><FaStar size={14} />
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-500 h-20 flex items-center justify-center">
          Avalie filmes para ver o seu gráfico.
        </div>
      )}
    </div>
  );
}