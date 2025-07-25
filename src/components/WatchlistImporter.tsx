// arquivo: src/components/WatchlistImporter.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseLetterboxdWatchlistCsv, ProcessedWatchlistEntry } from '../utils/csvProcessor';
import { searchMovies } from '../services/tmdbService';
import { addMovieToWatchlist } from '../services/watchlistService';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Fuse from 'fuse.js';

interface WatchlistImporterProps {
  onImportComplete: () => void; // Callback para atualizar a lista após a importação
}

export default function WatchlistImporter({ onImportComplete }: WatchlistImporterProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(null);
      setIsError(false);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    if (!user) {
      setMessage('Você precisa estar logado para importar sua watchlist.');
      setIsError(true);
      return;
    }
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo CSV para importar.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('Importando filmes...');
    setIsError(false);

    let importedCount = 0;
    let skippedCount = 0; // Para filmes com 0.0 estrelas que não pudemos substituir
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const entries = await parseLetterboxdWatchlistCsv(selectedFile);

      const fuseOptions = {
        includeScore: true,
        keys: [
          { name: 'title', weight: 0.8 },
          { name: 'original_title', weight: 0.5 },
          { name: 'release_date', getFn: (movie: any) => movie.release_date?.substring(0, 4), weight: 0.7 }
        ],
        threshold: 0.3, // Mantém threshold para o fuzzy matching
        distance: 100,
        ignoreLocation: true
      };

      for (const entry of entries) {
        try {
          // ✅ MUDANÇA AQUI: Buscar no TMDB APENAS com o título (sem o ano na query inicial)
          const searchResults = await searchMovies(entry.title);

          let movieFound = null;
          let currentSkipReason = ''; // Para detalhar o motivo do skip/falha

          if (searchResults.results.length > 0) {
            const fuse = new Fuse(searchResults.results, fuseOptions);
            const fuseResult = fuse.search(entry.title);

            if (fuseResult.length > 0) {
              // Priority 1: Best match by Fuse.js score that matches year AND has non-zero rating
              const bestMatchWithGoodRatingAndYear = fuseResult.find(item => {
                  const matchedYear = item.item.release_date?.substring(0, 4);
                  return (item.score ?? 1) < 0.3 && matchedYear === entry.year && item.item.vote_average !== 0.0;
              });

              if (bestMatchWithGoodRatingAndYear) {
                  movieFound = bestMatchWithGoodRatingAndYear.item;
              } else {
                  // Priority 2: If no good match with non-zero rating and year,
                  // search for the best match that matches year (even if 0.0 rating)
                  const bestMatchWithYear = fuseResult.find(item => {
                      const matchedYear = item.item.release_date?.substring(0, 4);
                      return (item.score ?? 1) < 0.3 && matchedYear === entry.year;
                  });

                  if (bestMatchWithYear && bestMatchWithYear.item.vote_average !== 0.0) {
                      // Se o melhor match com o ano tiver rating bom, usá-lo.
                      movieFound = bestMatchWithYear.item;
                  } else if (bestMatchWithYear) {
                      // Se o melhor match com o ano tiver 0.0, mas ainda é o melhor com ano, usá-lo.
                      // Ele será filtrado abaixo, mas é o "mais próximo" que encontramos.
                      movieFound = bestMatchWithYear.item;
                      currentSkipReason = `pulado (avaliação 0.0 no TMDB e nenhuma alternativa melhor para "${entry.title}" encontrada).`;
                  } else {
                      // Priority 3: If no match with year, take the overall best fuzzy match (regardless of year or rating)
                      // if its score is still reasonable. This is the "closest" overall.
                      const absoluteBestFuzzy = fuseResult[0].item;
                      if ((fuseResult[0].score ?? 1) < 0.5) { // Only take if fuzzy score is not too bad
                          movieFound = absoluteBestFuzzy;
                          if (absoluteBestFuzzy.vote_average === 0.0) {
                              currentSkipReason = `pulado (avaliação 0.0 no TMDB e nenhuma alternativa melhor para "${entry.title}" encontrada).`;
                          }
                      }
                  }
              }
            } else {
                // Fallback se o Fuse.js não encontrar NADA para o título puro
                // Tentar uma correspondência exata de título E ano entre os resultados da API,
                // ou pegar o primeiro resultado bruto.
                const exactMatchFallback = searchResults.results.find(movie => 
                    movie.title === entry.title && movie.release_date?.substring(0, 4) === entry.year
                );
                movieFound = exactMatchFallback || searchResults.results[0];

                if (movieFound && movieFound.vote_average === 0.0) {
                    currentSkipReason = `pulado (avaliação 0.0 no TMDB e nenhuma alternativa melhor para "${entry.title}" encontrada).`;
                }
            }
          }

          if (movieFound && movieFound.vote_average !== 0.0) { // ✅ Verifica a avaliação final antes de adicionar
            await addMovieToWatchlist(user.id, movieFound.id);
            importedCount++;
          } else {
            // Se movieFound for nulo OU tiver vote_average 0.0 (e não foi substituído por melhor), então falha/pula
            if (currentSkipReason) { // Se já temos uma razão específica de skip
              skippedCount++;
              errors.push(`Filme "${entry.title} (${entry.year})" ${currentSkipReason}`);
            } else {
              failedCount++;
              errors.push(`Filme "${entry.title} (${entry.year})" não encontrado no TMDB.`);
            }
          }
        } catch (innerError: any) {
          failedCount++;
          errors.push(`Erro ao processar "${entry.title}": ${innerError.message || 'Erro desconhecido'}`);
          console.error(`Erro ao processar filme ${entry.title}:`, innerError);
        }
      }

      if (importedCount > 0 || skippedCount > 0) {
        let successMessage = `Importação concluída! ${importedCount} filme(s) adicionado(s) à sua watchlist.`;
        if (skippedCount > 0) {
          successMessage += ` ${skippedCount} filme(s) pulado(s) (avaliação 0.0).`;
        }
        if (failedCount > 0) {
          successMessage += ` ${failedCount} falha(s). Veja os erros no console.`;
          setIsError(true);
        } else {
          setIsError(false);
        }
        setMessage(successMessage);
        onImportComplete();
      } else if (failedCount > 0) {
        setMessage(`Nenhum filme importado. ${failedCount} falha(s). Veja os erros no console.`);
        setIsError(true);
      } else {
        setMessage('Nenhuma entrada válida encontrada no arquivo.');
        setIsError(true);
      }

      if (errors.length > 0) {
        console.warn('Erros durante a importação:', errors);
      }

    } catch (error: any) {
      setMessage(`Erro ao ler o arquivo CSV: ${error.message || 'Verifique o formato do arquivo.'}`);
      setIsError(true);
      console.error('Erro total na importação:', error);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      const fileInput = document.getElementById('watchlist-csv-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-bold text-white">Importar Watchlist do Letterboxd</h2>
      <p className="text-gray-400 text-center text-sm">
        Faça o upload do seu arquivo `watchlist.csv` exportado do Letterboxd.
      </p>

      <input
        type="file"
        id="watchlist-csv-upload"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-cyan-500 file:text-white
                   hover:file:bg-cyan-600
                   cursor-pointer"
        disabled={isLoading}
      />

      {selectedFile && (
        <p className="text-sm text-gray-300">Arquivo selecionado: {selectedFile.name}</p>
      )}

      <button
        onClick={handleImport}
        disabled={!selectedFile || isLoading}
        className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin" /> Importando...
          </>
        ) : (
          <>
            <FaUpload /> Iniciar Importação
          </>
        )}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm text-center w-full ${isError ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
          {isError ? <FaTimesCircle className="inline mr-2" /> : <FaCheckCircle className="inline mr-2" />}
          {message}
        </div>
      )}

      {!user && (
        <p className="text-red-400 text-sm mt-4">
          Por favor, <span className="font-semibold">faça login</span> para usar o importador de watchlist.
        </p>
      )}
    </div>
  );
}