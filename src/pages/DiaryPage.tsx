// ficheiro: src/pages/DiaryPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPaginatedEnrichedLogs, EnrichedLog, SortOptions, FilterOptions } from '../services/logService';
import DiaryGridItem from '../components/DiaryGridItem';
import Pagination from '../components/Pagination';
import FilterControls from '../components/FilterControls'; // ✅ IMPORTAMOS OS FILTROS
import { Link } from 'react-router-dom';

export default function DiaryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<EnrichedLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ NOVOS ESTADOS PARA FILTRO E ORDENAÇÃO
  const [sort, setSort] = useState<SortOptions>({ by: 'watched_date', order: 'desc' });
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchLogs = useCallback((pageToFetch: number, currentSort: SortOptions, currentFilters: FilterOptions) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);

    getPaginatedEnrichedLogs(user.id, pageToFetch, 32, currentSort, currentFilters)
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
  
  // ✅ O useEffect agora reage a mudanças na página, ordenação ou filtros
  useEffect(() => {
    fetchLogs(currentPage, sort, filters);
  }, [currentPage, sort, filters, fetchLogs]);

  const handlePageChange = (newPage: number) => {
    window.scrollTo(0, 0);
    setCurrentPage(newPage);
  };
  
  // ✅ FUNÇÕES PARA ATUALIZAR O ESTADO A PARTIR DOS CONTROLOS
  const handleSortChange = (newSort: SortOptions) => {
    setCurrentPage(1); // Reset para a primeira página ao mudar a ordenação
    setSort(newSort);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setCurrentPage(1); // Reset para a primeira página ao mudar o filtro
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

      {/* ✅ ADICIONAMOS O COMPONENTE DE FILTROS */}
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
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {logs.map((log) => (
              <DiaryGridItem key={log.id} log={log} />
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