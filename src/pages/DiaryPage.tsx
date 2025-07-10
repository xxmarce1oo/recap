// ficheiro: src/pages/DiaryPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPaginatedEnrichedLogs, EnrichedLog, SortOptions, FilterOptions } from '../services/logService';
import ReviewFeedCard from '../components/ReviewFeedCard'; // ✅ USANDO O NOVO CARTÃO DE FEED
import Pagination from '../components/Pagination';
import FilterControls from '../components/FilterControls';
import { Link } from 'react-router-dom';

export default function DiaryPage() {
  const { user } = useAuth();
  // ... (estados existentes)
  const [logs, setLogs] = useState<EnrichedLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortOptions>({ by: 'watched_date', order: 'desc' });
  const [filters, setFilters] = useState<FilterOptions>({});


  const fetchLogs = useCallback((pageToFetch: number, currentSort: SortOptions, currentFilters: FilterOptions) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    getPaginatedEnrichedLogs(user.id, pageToFetch, 10, currentSort, currentFilters) // 10 por página é bom para um feed
      .then(data => {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setCurrentPage(pageToFetch);
      })
      .catch(err => {
        console.error(err);
        setError('Não foi possível carregar o seu diário.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);
  
  useEffect(() => {
    fetchLogs(currentPage, sort, filters);
  }, [currentPage, sort, filters, fetchLogs]);
  
  // ... (resto das funções handle... continua igual)
  const handlePageChange = (newPage: number) => {
    window.scrollTo(0, 0);
    setCurrentPage(newPage);
  };
  
  const handleSortChange = (newSort: SortOptions) => {
    setCurrentPage(1);
    setSort(newSort);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };


  if (!user && isLoading) {
    return <div className="text-center py-24">A carregar...</div>;
  }

  if (!user && !isLoading) {
    return (
      <div className="container mx-auto px-6 md:px-12 text-center py-24">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-gray-400 mt-2">Precisa de estar autenticado para ver o seu diário.</p>
        <Link to="/" className="text-cyan-400 mt-4 inline-block hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">Meu Diário</h1>
        <p className="text-gray-400 mt-2">Todos os filmes que você já registou.</p>
      </div>

      <FilterControls 
        sortOptions={sort}
        filterOptions={filters}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
      />

      {isLoading ? (
        <p className="text-center text-lg">A carregar...</p>
      ) : error ? (
        <p className="text-center text-lg text-red-500">{error}</p>
      ) : logs.length > 0 ? (
        <>
          {/* ✅ LAYOUT DE FEED VERTICAL */}
          <div className="space-y-6">
            {logs.map((log) => (
              <ReviewFeedCard 
                key={log.id} 
                log={log} 
                username={user?.user_metadata?.username || 'Usuário'}
                userAvatarUrl={user?.user_metadata?.avatar_url}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <p className="text-center text-lg text-gray-500">Nenhum filme encontrado com os filtros selecionados.</p>
      )}
    </div>
  );
}