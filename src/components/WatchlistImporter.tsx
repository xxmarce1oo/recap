// arquivo: src/components/WatchlistImporter.tsx

import React, { useState, useCallback, DragEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { parseLetterboxdWatchlistCsv } from '../utils/csvProcessor';
import { searchMovies } from '../services/tmdbService';
import { addMovieToWatchlist } from '../services/watchlistService';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaFileCsv } from 'react-icons/fa';
import Fuse from 'fuse.js';

// Definição do tipo Movie (ajuste conforme a estrutura real do seu projeto)
interface Movie {
  id: number;
  title: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  [key: string]: any;
}

interface WatchlistImporterProps {
  onImportComplete: () => void;
}

// Enum para gerenciar os estados da UI de forma mais clara
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

  // Lógica de importação (mantida a mesma, pois já é robusta)
  const handleImport = async () => {
    if (!user) {
      setMessage('Você precisa estar logado para importar sua watchlist.');
      setStatus(ImportStatus.Error);
      return;
    }
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo CSV para importar.');
      setStatus(ImportStatus.Error);
      return;
    }

    setStatus(ImportStatus.Loading);
    setMessage('Iniciando importação... Isso pode levar um momento.');

    // A lógica interna de busca e adição foi mantida
    // ... (código de processamento, fuse.js, etc.)
    // Para abreviar a explicação, vou colar a lógica original que já funciona bem.
    let importedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    try {
      const entries = await parseLetterboxdWatchlistCsv(selectedFile);
      setMessage(`Processando ${entries.length} filmes...`);

      const fuseOptions = {
        includeScore: true,
        keys: [
          { name: 'title', weight: 0.8 },
          { name: 'original_title', weight: 0.5 },
          { name: 'release_date', getFn: (movie: any) => movie.release_date?.substring(0, 4), weight: 0.7 }
        ],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true
      };

      for (const entry of entries) {
        try {
          const searchResults = await searchMovies(entry.title);
          let movieFound: Movie | null = null;
          
          // ✅ FILTRO INICIAL: Remove filmes sem poster ou com nota 0 ANTES da busca
          const validMovies = searchResults.results.filter(
            movie => movie.poster_path && movie.vote_average > 0
          );

          if (validMovies.length > 0) {
            const fuse = new Fuse(validMovies, fuseOptions);
            const fuseResult = fuse.search(entry.title);
            
            // Tenta encontrar a melhor correspondência que também bata o ano
            const bestMatchByYear = fuseResult.find(
              item => item.item.release_date?.substring(0, 4) === entry.year
            );

            movieFound = bestMatchByYear ? bestMatchByYear.item : fuseResult[0]?.item;
          }

          if (movieFound) {
            await addMovieToWatchlist(user.id, movieFound.id);
            importedCount++;
          } else {
            failedCount++;
            errors.push(`Filme "${entry.title} (${entry.year})" não encontrado.`);
          }
        } catch (innerError: any) {
          failedCount++;
          errors.push(`Erro ao processar "${entry.title}": ${innerError.message || 'Erro desconhecido'}`);
        }
      }

      let successMessage = `Importação concluída! ${importedCount} filme(s) adicionado(s).`;
      if (failedCount > 0) {
        successMessage += ` ${failedCount} falha(s).`;
        console.warn('Erros durante a importação:', errors);
      }

      setMessage(successMessage);
      setStatus(ImportStatus.Success);
      onImportComplete();

    } catch (error: any) {
      setMessage(`Erro ao ler o arquivo CSV: ${error.message || 'Verifique o formato do arquivo.'}`);
      setStatus(ImportStatus.Error);
    } finally {
      setSelectedFile(null); // Limpa o arquivo após o processo
    }
  };
  
  // Reseta o estado quando o usuário quer fazer um novo upload
  const handleReset = () => {
    setSelectedFile(null);
    setStatus(ImportStatus.Idle);
    setMessage('');
  };

  // Funções para lidar com arrastar e soltar (drag and drop)
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


  // Renderização condicional para cada estado
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
      default: // Idle
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

      {/* Se um arquivo for selecionado, mostra um painel diferente */}
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