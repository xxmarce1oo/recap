// arquivo: src/components/MovieCarousel.tsx

import { Link } from 'react-router-dom';
import { Movie } from '../models/movie';
import MovieCard from './MovieCard';

interface Props {
  title: string;
  movies: Movie[];
}

const categorySlugs: { [key: string]: string } = {
  'Lançamentos': 'now_playing',
  'Melhores Avaliados': 'top_rated',
  'Populares': 'popular',
};

export default function MovieCarousel({ title, movies }: Props) {
  if (!movies || movies.length === 0) {
    return null;
  }

  const moviesToShow = movies.slice(0, 6);
  const categorySlug = categorySlugs[title] || 'all';

  return (
    // ✅ Container principal responsivo
    <section className="space-y-3 sm:space-y-4">
      
      {/* CABEÇALHO: Título à esquerda, "Ver mais" à direita */}
      <div className="flex justify-between items-baseline">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
        
        {movies.length > 6 && (
          <Link
            to={`/movies/${categorySlug}`}
            className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors tracking-wider uppercase font-semibold"
          >
            Ver mais
          </Link>
        )}
      </div>
      
      {/* LISTA DE FILMES: 4 cards em mobile, esconde os últimos 2 */}
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 sm:gap-4 md:grid-cols-6 md:gap-4 lg:flex lg:justify-between">
        {moviesToShow.map((movie, index) => (
          <div key={movie.id} className={`flex justify-center lg:block ${index >= 4 ? 'hidden sm:flex' : ''}`}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}