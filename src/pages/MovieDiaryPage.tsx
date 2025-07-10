// ficheiro: src/pages/MovieDiaryPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllLogsForMovie, EnrichedLog } from '../services/logService';
import { getMovieDetails } from '../services/tmdbService';
import { Movie } from '../models/movie';
import DiaryEntryCard from '../components/DiaryEntryCard'; // ✅ Usamos o cartão de lista

export default function MovieDiaryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [logs, setLogs] = useState<EnrichedLog[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movieId = Number(id);

  useEffect(() => {
    if (!user || !movieId) return;

    const fetchMovieLogs = async () => {
      setIsLoading(true);
      try {
        const [fetchedLogs, fetchedMovie] = await Promise.all([
          getAllLogsForMovie(user.id, movieId),
          getMovieDetails(movieId)
        ]);
        
        setLogs(fetchedLogs);
        setMovie(fetchedMovie);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o seu histórico para este filme.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieLogs();
  }, [user, movieId]);


  if (isLoading) {
    return <div className="text-center py-24">A carregar histórico...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="mb-8">
        <Link to={`/movie/${movieId}`} className="text-cyan-400 hover:underline text-sm">
          &larr; Voltar para a página do filme
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mt-2">{movie?.title}</h1>
        <p className="text-gray-400 mt-2">
          Você registou este filme <span className="font-bold text-white">{logs.length}</span> vez(es).
        </p>
      </div>

      {/* ✅ Usando o layout de lista para consistência */}
      <div className="space-y-4">
        {logs.map((log) => (
          <DiaryEntryCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}