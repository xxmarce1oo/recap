// arquivo: src/components/WatchlistImporter.tsx

import React, { useState, DragEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseLetterboxdWatchlistCsv } from '../utils/csvProcessor';
import { searchMulti, getMovieDetails, MultiSearchResult } from '../services/tmdbService';
import { addMovieToWatchlist } from '../services/watchlistService';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaFileCsv } from 'react-icons/fa';
import Fuse from 'fuse.js';

interface WatchlistImporterProps {
  onImportComplete: () => void;
}

enum ImportStatus {
  Idle,
  Loading,
  Success,
  Error,
}

const MINIMUM_RUNTIME_MINUTES = 40; // Duração mínima de um filme para ser importado

export default function WatchlistImporter({ onImportComplete }: WatchlistImporterProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>(ImportStatus.Idle);
  const [message, setMessage] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImport = async () => {
    if (!user || !selectedFile) {
      setMessage('Por favor, faça login e selecione um arquivo CSV.');
      setStatus(ImportStatus.Error);
      return;
    }

    setStatus(ImportStatus.Loading);
    setMessage('Iniciando importação... Isso pode levar um momento.');

    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const entries = await parseLetterboxdWatchlistCsv(selectedFile);
      setMessage(`Processando ${entries.length} itens...`);
      
      const fuseOptions = {
        includeScore: true,
        keys: [
            { name: 'title', weight: 0.5 },
            { name: 'original_title', weight: 0.5 },
        ],
        threshold: 0.6,
      };

      for (const entry of entries) {
        let failureReason = '';

        try {
          const searchResults = await searchMulti(entry.title, 'en-US');
          let bestCandidate: MultiSearchResult | null = null;

          if (searchResults.results.length === 0) {
            failureReason = 'Não foi encontrado na busca da API.';
          } else {
            const validItems = searchResults.results.filter(
              item => (item.media_type === 'movie') && item.poster_path
            );

            if (validItems.length === 0) {
              failureReason = 'Resultados encontrados, mas nenhum era filme com pôster.';
            } else {
              const targetYear = parseInt(entry.year, 10);
              const acceptableYears = [String(targetYear - 1), String(targetYear), String(targetYear + 1)];
              
              const moviesInYearRange = validItems.filter(item => 
                item.release_date && acceptableYears.includes(item.release_date.substring(0, 4))
              );

              if (moviesInYearRange.length === 0) {
                failureReason = `Nenhum filme válido encontrado no intervalo de anos [${targetYear - 1}-${targetYear + 1}].`;
              } else {
                const fuse = new Fuse(moviesInYearRange, fuseOptions);
                const fuseResult = fuse.search(entry.title);

                if (fuseResult.length > 0) {
                   fuseResult.sort((a, b) => {
                     const scoreDiff = (a.score || 1) - (b.score || 1);
                     if (Math.abs(scoreDiff) > 0.001) return scoreDiff;
                     return (b.item.vote_count || 0) - (a.item.vote_count || 0);
                   });
                   bestCandidate = fuseResult[0].item;
                } else {
                  failureReason = 'Títulos encontrados no ano, mas nenhum era similar o suficiente.';
                }
              }
            }
          }
          
          if (bestCandidate) {
            const movieDetails = await getMovieDetails(bestCandidate.id);
            if (movieDetails.runtime && movieDetails.runtime >= MINIMUM_RUNTIME_MINUTES) {
              await addMovieToWatchlist(user.id, bestCandidate.id);
              importedCount++;
            } else {
              failedCount++;
              failureReason = `Encontrado, mas sua duração (${movieDetails.runtime || 'N/A'} min) é menor que o mínimo de ${MINIMUM_RUNTIME_MINUTES} min.`;
              errors.push(`"${entry.title} (${entry.year})" falhou: ${failureReason}`);
            }
          } else {
            failedCount++;
            errors.push(`"${entry.title} (${entry.year})" falhou: ${failureReason || 'Critérios não atendidos.'}`);
          }
        } catch (innerError: any) {
          failedCount++;
          errors.push(`Erro de sistema ao processar "${entry.title}": ${innerError.message || 'Erro desconhecido'}`);
        }
      }

      let successMessage = `Importação concluída! ${importedCount} filme(s) adicionado(s).`;
      if (failedCount > 0) {
        successMessage += ` ${failedCount} não foram importados. Verifique o console para mais detalhes.`;
        console.warn('Relatório de Falhas na Importação:', errors);
      }

      setMessage(successMessage);
      setStatus(ImportStatus.Success);
      onImportComplete();

    } catch (error: any) {
      setMessage(`Erro ao ler o arquivo CSV: ${error.message || 'Verifique o formato do arquivo.'}`);
      setStatus(ImportStatus.Error);
    } finally {
      setSelectedFile(null);
    }
  };
  
  const handleReset = () => {
    setSelectedFile(null);
    setStatus(ImportStatus.Idle);
    setMessage('');
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      if (files[0].type === 'text/csv' || files[0].name.endsWith('.csv')) {
        setSelectedFile(files[0]);
        setStatus(ImportStatus.Idle);
        setMessage('');
      } else {
        setMessage('Formato de arquivo inválido. Por favor, envie um arquivo .csv.');
        setStatus(ImportStatus.Error);
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const renderContent = () => {
    switch (status) {
      case ImportStatus.Loading:
        return (
          <div className="text-center">
            <FaSpinner className="animate-spin text-cyan-400 text-4xl mx-auto" />
            <p className="mt-4 text-lg font-semibold">Importando...</p>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        );
      case ImportStatus.Success:
        return (
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-4xl mx-auto" />
            <p className="mt-4 text-lg font-semibold">Sucesso!</p>
            <p className="text-sm text-gray-300">{message}</p>
            <button onClick={handleReset} className="mt-4 text-sm text-cyan-400 hover:underline">Importar outro arquivo</button>
          </div>
        );
      case ImportStatus.Error:
        return (
          <div className="text-center">
            <FaTimesCircle className="text-red-500 text-4xl mx-auto" />
            <p className="mt-4 text-lg font-semibold">Ocorreu um Erro</p>
            <p className="text-sm text-red-400">{message}</p>
            <button onClick={handleReset} className="mt-4 text-sm text-cyan-400 hover:underline">Tentar novamente</button>
          </div>
        );
      default:
        return (
            <div className="text-center">
              <input
                type="file"
                id="watchlist-csv-upload"
                accept=".csv"
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
                disabled={!!selectedFile}
              />
              <FaUpload className="text-gray-500 text-4xl mx-auto" />
              <p className="mt-2 font-semibold text-gray-300">
                Arraste seu arquivo `watchlist.csv` aqui
              </p>
              <p className="text-xs text-gray-500">ou</p>
              <button
                type="button"
                onClick={() => document.getElementById('watchlist-csv-upload')?.click()}
                className="text-sm font-bold text-cyan-400 hover:text-cyan-300"
              >
                Selecione um arquivo
              </button>
            </div>
        );
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg text-white transition-all">
      <h3 className="text-lg font-bold mb-1">Importar do Letterboxd</h3>
      <p className="text-sm text-gray-400 mb-4">Adicione filmes à sua watchlist a partir do seu arquivo de exportação.</p>

      {selectedFile && status === ImportStatus.Idle ? (
        <div className="bg-gray-700/50 p-4 rounded-md flex items-center justify-between">
            <div className='flex items-center gap-3'>
              <FaFileCsv className="text-cyan-400 text-2xl flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">Pronto para importar.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white text-xs font-bold">Cancelar</button>
              <button onClick={handleImport} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm">
                Importar
              </button>
            </div>
        </div>
      ) : (
        <label
          htmlFor="watchlist-csv-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex items-center justify-center w-full h-40 bg-gray-700/30 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragOver ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          {renderContent()}
        </label>
      )}
    </div>
  );
}