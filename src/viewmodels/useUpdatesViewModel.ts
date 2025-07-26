import { useState, useEffect, useMemo, useCallback } from 'react';

export interface Update {
  hash: string;
  date: string;
  message: string;
  description?: string;
  type: string;
  label?: string;
  color?: string;
}

export const useUpdatesViewModel = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Memoizar função de mudança de filtro
  const handleFilterChange = useCallback((filter: string | null) => {
    setActiveFilter(filter);
  }, []);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/updates.json');
        
        if (!response.ok) {
          throw new Error('Não foi possível carregar o log de atualizações.');
        }
        
        const data = await response.json();
        
        // Validar e normalizar dados de uma vez
        const validUpdates = data
          .filter((update: any) => update?.hash && update?.date && update?.message)
          .map((update: any) => ({
            hash: update.hash,
            date: update.date,
            message: update.message,
            description: update.description || '',
            type: update.type || 'general',
            label: update.label || 'Indefinido',
            color: update.color || 'bg-gray-500'
          }));
          
        setUpdates(validUpdates);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Ocorreu um erro ao buscar as atualizações.');
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  // Memoizar filtros disponíveis
  const availableFilters = useMemo(() => {
    if (updates.length === 0) return [];
    
    const allLabels = updates
      .map(update => update.label)
      .filter((label): label is string => 
        Boolean(label) && (label ?? '').trim() !== '' && label !== 'Indefinido'
      );
    
    return [...new Set(allLabels)].sort();
  }, [updates]);

  // Memoizar updates filtradas
  const filteredUpdates = useMemo(() => {
    if (!activeFilter || activeFilter === 'Todos') return updates;
    return updates.filter(update => update.label === activeFilter);
  }, [updates, activeFilter]);

  return {
    updates: filteredUpdates,
    isLoading,
    error,
    activeFilter,
    availableFilters,
    setActiveFilter: handleFilterChange
  };
};