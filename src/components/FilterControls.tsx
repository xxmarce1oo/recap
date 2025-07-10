// ficheiro: src/components/FilterControls.tsx

import { SortOptions, FilterOptions } from '../services/logService';

interface Props {
  sortOptions: SortOptions;
  filterOptions: FilterOptions;
  onSortChange: (options: SortOptions) => void;
  onFilterChange: (options: FilterOptions) => void;
}

export default function FilterControls({ sortOptions, filterOptions, onSortChange, onFilterChange }: Props) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [by, order] = e.target.value.split('-') as [SortOptions['by'], SortOptions['order']];
    onSortChange({ by, order });
  };

  const handleRatingFilter = (rating: number | undefined) => {
    onFilterChange({ ...filterOptions, rating });
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Controlo de Ordenação */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-sm text-gray-400">Ordenar por:</label>
        <select
          id="sort-by"
          value={`${sortOptions.by}-${sortOptions.order}`}
          onChange={handleSortChange}
          className="bg-gray-700 text-white text-sm rounded-md p-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="watched_date-desc">Data (Mais Recente)</option>
          <option value="watched_date-asc">Data (Mais Antigo)</option>
          <option value="rating-desc">Nota (Maior)</option>
          <option value="rating-asc">Nota (Menor)</option>
        </select>
      </div>

      {/* Controlo de Filtro por Nota */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Filtrar por nota:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleRatingFilter(filterOptions.rating === star ? undefined : star)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                filterOptions.rating === star
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {star} ★
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}