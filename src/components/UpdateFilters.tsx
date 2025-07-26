import { memo } from 'react';
import clsx from 'clsx'; // Biblioteca para construir strings de classes condicionalmente

interface UpdateFiltersProps {
  filters: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  isLoading: boolean;
}

// Array de larguras para os skeletons, imitando o original
const skeletonWidths = ['60px', '80px', '100px', '120px'];

export const UpdateFilters = memo(({ filters, activeFilter, onFilterChange, isLoading }: UpdateFiltersProps) => {

  // Se estiver carregando, exibe um skeleton com a mesma estrutura de botões
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3 mb-12">
        {skeletonWidths.map((width, i) => (
          <div
            key={`skeleton-${i}`}
            className="h-9 bg-gray-700 rounded-full animate-pulse"
            style={{ width }}
          />
        ))}
      </div>
    );
  }

  if (filters.length === 0) {
    return null;
  }

  // Combina o filtro "Todos" com os outros filtros para um único map
  const allFilters = [null, ...filters];

  return (
    <div className="flex flex-wrap gap-3 mb-12">
      {allFilters.map(filter => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter ?? 'todos'} // Usa 'todos' como chave para o filtro nulo
            onClick={() => onFilterChange(filter)}
            type="button"
            className={clsx(
              "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900",
              {
                'bg-cyan-500 text-white shadow-lg transform scale-105': isActive,
                'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white': !isActive,
              }
            )}
          >
            {filter ?? 'Todos'}
          </button>
        );
      })}
    </div>
  );
});

UpdateFilters.displayName = 'UpdateFilters';