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
    <section className="space-y-3 sm:space-y-4">
      
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
      
      {/* LISTA DE FILMES: 
        - Usa 'flex' e 'justify-between' para alinhar o primeiro e o último card com os textos.
        - O tamanho dos cards foi aumentado no componente MovieCard para preencher o espaço.
      */}
      <div className="flex justify-between items-start">
        {moviesToShow.map((movie, index) => (
          <div 
            key={movie.id} 
            className={`
              ${index >= 4 ? 'hidden sm:block' : 'block'}
              ${index >= 5 ? 'hidden md:block' : ''}
            `}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}