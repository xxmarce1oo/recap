// arquivo: src/utils/csvProcessor.ts

import Papa, { ParseResult } from 'papaparse';

// Interface para as colunas do seu arquivo CSV da watchlist do Letterboxd
interface LetterboxdWatchlistEntryCsv {
  Date: string;
  Name: string;
  Year: string;
  'Letterboxd URI': string;
}

// Interface para o formato que queremos usar no nosso aplicativo
export interface ProcessedWatchlistEntry {
  title: string;
  year: string;
}

/**
 * Processa um arquivo CSV da watchlist do Letterboxd e retorna os dados em um formato utilizável.
 * Assume que o CSV tem as colunas 'Name' e 'Year'.
 * @param file O arquivo CSV (geralmente `watchlist.csv` do Letterboxd).
 * @returns Uma Promise que resolve para um array de ProcessedWatchlistEntry.
 */
export const parseLetterboxdWatchlistCsv = (file: File): Promise<ProcessedWatchlistEntry[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      Papa.parse<LetterboxdWatchlistEntryCsv>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<LetterboxdWatchlistEntryCsv>) => {
          const processedData: ProcessedWatchlistEntry[] = results.data
            .map((row) => {
              // Garante que 'Name' e 'Year' existem antes de processar
              if (row.Name && row.Year) {
                return {
                  title: row.Name,
                  year: row.Year,
                };
              }
              return null; // Retorna null para entradas inválidas
            })
            .filter(Boolean) as ProcessedWatchlistEntry[]; // Remove entradas nulas

          resolve(processedData);
        },
        error: (error: Error) => {
          reject(error);
        },
      });
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsText(file);
  });
};