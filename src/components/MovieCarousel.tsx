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
    // ✅ Este é o CONTAINER principal que você pediu.
    // Ele organiza o cabeçalho e os cards.
    <section className="space-y-3">
      
      {/* CABEÇALHO: Título à esquerda, "Ver mais" à direita */}
      <div className="flex justify-between items-baseline">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        
        {movies.length > 6 && (
          <Link
            to={`/movies/${categorySlug}`}
            className="text-sm text-gray-400 hover:text-white transition-colors tracking-wider uppercase font-semibold"
          >
            Ver mais
          </Link>
        )}
      </div>
      
      {/* LISTA DE FILMES: Primeiro card alinhado com o título, último card alinhado com "Ver mais" */}
      <div className="flex justify-between">
        {moviesToShow.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}