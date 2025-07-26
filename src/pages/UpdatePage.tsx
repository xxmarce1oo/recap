// arquivo: src/pages/UpdatesPage.tsx

import { useState, useEffect, useMemo } from 'react';

interface Update {
  hash: string;
  date: string;
  message: string;
  description: string;
  type: string;
  label: string;
  color: string;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para controlar o filtro ativo
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch('/updates.json')
      .then(response => {
        if (!response.ok) throw new Error('Não foi possível carregar o log de atualizações.');
        return response.json();
      })
      .then(data => setUpdates(data))
      .catch(err => {
        console.error(err);
        setError('Ocorreu um erro ao buscar as atualizações.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Pega os tipos de filtros disponíveis a partir dos updates carregados
  const availableFilters = useMemo(() => {
    const allLabels = updates.map(update => update.label);
    // Cria uma lista de rótulos únicos
    return [...new Set(allLabels)];
  }, [updates]);

  // Filtra os updates com base no filtro ativo
  const filteredUpdates = useMemo(() => {
    if (!activeFilter) return updates;
    return updates.filter(update => update.label === activeFilter);
  }, [updates, activeFilter]);

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Registro de Atualizações
        </h1>
        <p className="text-gray-400 mb-8">
          Aqui estão as últimas melhorias e novidades implementadas no The 1st rule.
        </p>

        {/* Seção de Filtros */}
        {availableFilters.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-12">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                !activeFilter ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            {availableFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${
                  activeFilter === filter ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <p className="text-center">Carregando atualizações...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : filteredUpdates.length > 0 ? (
          <div className="space-y-8 border-l-2 border-gray-700 ml-3">
            {filteredUpdates.map((update) => (
              <div key={update.hash} className="relative pl-8">
                {/* Bolinha com a cor dinâmica vinda do script */}
                <div className={`absolute -left-[7px] top-1 h-3 w-3 ${update.color} rounded-full`}></div>
                
                <div className="flex items-center gap-3">
                  {/* Rótulo (Tag) com a cor correspondente */}
                  <span className={`text-xs font-bold px-2 py-0.5 ${update.color} bg-opacity-20 text-white rounded`}>
                    {update.label}
                  </span>
                  <p className="text-sm text-gray-400">
                    {new Date(update.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <h2 className="text-xl font-semibold text-white mt-2">{update.message}</h2>
                
                {update.description && (
                  <p className="text-gray-300 mt-2 text-base whitespace-pre-line">
                    {update.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhuma atualização encontrada para o filtro selecionado.</p>
        )}
      </div>
    </div>
  );
}