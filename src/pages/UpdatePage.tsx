// arquivo: src/pages/UpdatesPage.tsx

import { useState, useEffect } from 'react';

interface Update {
  hash: string;
  date: string;
  message: string;
  description: string; // Adicionamos o campo de descrição
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/updates.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Não foi possível carregar o log de atualizações.');
        }
        return response.json();
      })
      .then(data => {
        setUpdates(data);
      })
      .catch(err => {
        console.error(err);
        setError('Ocorreu um erro ao buscar as atualizações.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Registro de Atualizações
        </h1>
        <p className="text-gray-400 mb-12">
          Aqui estão as últimas melhorias e novidades implementadas no The 1st rule.
        </p>

        {isLoading ? (
          <p className="text-center">Carregando atualizações...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : updates.length > 0 ? (
          <div className="space-y-8 border-l-2 border-gray-700 ml-3">
            {updates.map((update) => (
              <div key={update.hash} className="relative pl-8">
                <div className="absolute -left-[7px] top-1 h-3 w-3 bg-cyan-500 rounded-full"></div>
                <p className="text-sm text-gray-400 mb-1">{new Date(update.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'})}</p>
                <h2 className="text-xl font-semibold text-white">{update.message}</h2>
                
                {/* ✅ Renderiza a descrição se ela existir */}
                {update.description && (
                  <p className="text-gray-300 mt-2 text-base whitespace-pre-line">
                    {update.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Nenhuma atualização encontrada.</p>
        )}
      </div>
    </div>
  );
}