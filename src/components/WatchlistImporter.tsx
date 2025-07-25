// arquivo: src/components/WatchlistImporter.tsx

import React, { useState, DragEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseLetterboxdWatchlistCsv } from '../utils/csvProcessor';
import { searchMovies } from '../services/tmdbService';
import { addMovieToWatchlist } from '../services/watchlistService';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaFileCsv } from 'react-icons/fa';
import Fuse from 'fuse.js';
import { Movie } from '../models/movie';

interface WatchlistImporterProps {
  onImportComplete: () => void;
}

enum ImportStatus {
  Idle,
  Loading,
  Success,
  Error,
}

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
      setMessage(`Processando ${entries.length} filmes...`);

      const fuseOptions = {
        // A busca Fuse.js agora foca apenas nos títulos
        keys: ['title', 'original_title'],
        threshold: 0.4, // Um pouco mais flexível para pequenas diferenças de título
      };

for (const entry of entries) {
        try {
          const searchResults = await searchMovies(entry.title, 'en-US');
          let movieFound: Movie | null = null;
          
          const validMovies = searchResults.results.filter(
            movie => movie.poster_path && movie.vote_average > 0
          );

          if (validMovies.length > 0) {
            const fuse = new Fuse(validMovies, fuseOptions);
            const fuseResult = fuse.search(entry.title);

            // ✅ NOVA LÓGICA DE PONTUAÇÃO:
            const scoredResults = fuseResult.map(result => {
              const movie = result.item;
              // A pontuação do Fuse.js (0 = perfeito, 1 = oposto)
              const titleScore = result.score ?? 1;

              // Adiciona uma penalidade se o ano não for uma correspondência exata
              const yearMatches = movie.release_date?.substring(0, 4) === entry.year;
              const yearPenalty = yearMatches ? 0 : 0.4; // Penalidade significativa, mas não eliminatória

              const finalScore = titleScore + yearPenalty;
              return { movie, finalScore };
            });

            // Ordena pela menor pontuação final e escolhe o melhor
            if (scoredResults.length > 0) {
              scoredResults.sort((a, b) => a.finalScore - b.finalScore);
              movieFound = scoredResults[0].movie;
            }
          }

          if (movieFound) {
            await addMovieToWatchlist(user.id, movieFound.id);
            importedCount++;
          } else {
            failedCount++;
            errors.push(`Filme "${entry.title} (${entry.year})" não encontrado com os critérios.`);
          }
        } catch (innerError: any) {
          failedCount++;
          errors.push(`Erro ao processar "${entry.title}": ${innerError.message || 'Erro desconhecido'}`);
        }
      }

      let successMessage = `Importação concluída! ${importedCount} filme(s) adicionado(s).`;
      if (failedCount > 0) {
        successMessage += ` ${failedCount} não foram importados.`;
        console.warn('Erros/Filmes não importados:', errors);
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
  
  // O restante do arquivo (handleReset, handleFileChange, renderContent, etc.) permanece o mesmo.
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