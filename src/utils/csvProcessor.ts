// arquivo: src/utils/csvProcessor.ts

import Papa from 'papaparse';

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
  // Podemos adicionar a URI do Letterboxd se for útil para algo depois, mas por enquanto, Title e Year são o suficiente para a busca no TMDB.
  // letterboxdUri: string; 
}

/**
 * Processa um arquivo CSV da watchlist do Letterboxd e retorna os dados em um formato utilizável.
 * Assume que o CSV tem as colunas 'Name' e 'Year'.
 * @param file O arquivo CSV (geralmente `watchlist.csv` do Letterboxd).
 * @returns Uma Promise que resolve para um array de ProcessedWatchlistEntry.
 */
export const parseLetterboxdWatchlistCsv = (file: File): Promise<ProcessedWatchlistEntry[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true, // A primeira linha contém os cabeçalhos
      skipEmptyLines: true,
      complete: (results) => {
        const processedData: ProcessedWatchlistEntry[] = results.data
          .map((row: any) => {
            const entry = row as LetterboxdWatchlistEntryCsv;

            // Garante que 'Name' e 'Year' existem antes de processar
            if (entry.Name && entry.Year) {
              return {
                title: entry.Name,
                year: entry.Year,
                // letterboxdUri: entry['Letterboxd URI'],
              };
            }
            return null; // Retorna null para entradas inválidas
          })
          .filter(Boolean) as ProcessedWatchlistEntry[]; // Remove entradas nulas

        resolve(processedData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};