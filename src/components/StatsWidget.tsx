// arquivo: src/components/StatsWidget.tsx

import { RatingsDistribution } from '../services/statsService';
import { FaStar } from 'react-icons/fa';

interface Props {
  reviewCount: number;
  distribution: RatingsDistribution;
}

// Mantemos os 10 níveis de exibição que queremos no gráfico
const RATING_DISPLAY_LEVELS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function StatsWidget({ reviewCount, distribution }: Props) {
  // ✅ LÓGICA DE AGRUPAMENTO
  // Cria um novo objeto para guardar as notas agrupadas
  const groupedDistribution: RatingsDistribution = RATING_DISPLAY_LEVELS.reduce((acc, level) => {
    acc[level] = 0;
    return acc;
  }, {} as RatingsDistribution);

  // Itera sobre as notas precisas recebidas
  for (const ratingStr in distribution) {
    const rating = parseFloat(ratingStr);
    const count = distribution[ratingStr];
    // Arredonda a nota para o meio ponto mais próximo (ex: 3.7 -> 3.5, 3.8 -> 4.0)
    const groupedRating = Math.round(rating * 2) / 2;
    // Soma a contagem na "caixa" correta
    if (groupedDistribution[groupedRating] !== undefined) {
      groupedDistribution[groupedRating] += count;
    }
  }

  // Encontra o valor máximo para a escala do gráfico a partir dos dados agrupados
  const maxCountLog = Math.log(Math.max(1, ...Object.values(groupedDistribution)) + 1);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <div className="flex items-center text-xs uppercase tracking-wider text-gray-400 mb-3">
        <span className="font-semibold">Ratings</span>
        <span className="flex-grow border-b border-gray-700/70 mx-3"></span>
        <span>{reviewCount}</span>
      </div>
      
      {reviewCount > 0 ? (
        <div className="flex items-end gap-3">
          <FaStar className="text-yellow-400 flex-shrink-0 mb-px" size={14} />
          
          <div className="flex items-end justify-between w-full h-20 gap-px">
            {RATING_DISPLAY_LEVELS.map(ratingLevel => {
              // Usa a contagem do nosso objeto de distribuição agrupado
              const count = groupedDistribution[ratingLevel] || 0;
              const heightPercentage = count > 0 ? (Math.log(count + 1) / maxCountLog) * 100 : 0;

              return (
                <div
                  key={ratingLevel}
                  className="flex-1 bg-gray-600 hover:bg-yellow-400 rounded-t-sm transition-all duration-200"
                  style={{ minHeight: '2px', height: `${heightPercentage}%` }}
                  title={`${count} filme(s) com nota próxima a ${ratingLevel}`}
                />
              );
            })}
          </div>

          <div className="flex flex-shrink-0 text-yellow-400 mb-px">
            {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
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