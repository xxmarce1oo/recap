// arquivo: src/pages/HomePage.tsx

import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import MovieCarousel from '../components/MovieCarousel'
import SkeletonCarousel from '../components/SkeletonCarousel'
import { useHomePageViewModel } from '../viewmodels/useHomePageViewModel'

export default function HomePage() {
  const { nowPlaying, topRated, heroMovie, isLoading, error } = useHomePageViewModel()

  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main>
        <div className="relative w-full h-screen">
          {/* ... (toda a sua Seção Hero continua igual) ... */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000"
            style={{ 
              backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie?.backdrop_path})`
            }}
          />
          <div className="absolute inset-0 w-full h-full bg-black/60" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
              Seu universo cinematográfico, <br /> mais inteligente.
            </h1>
            <h2 className="mt-4 text-xl md:text-2xl font-light max-w-3xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
              Vá além de organizar filmes. Receba <strong className="font-semibold text-cyan-300">recomendações personalizadas</strong> e converse com nossa <strong className="font-semibold text-cyan-300">IA especialista</strong> para encontrar seu próximo filme favorito.
            </h2>
            <a href="/register" className="mt-8 bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
              Crie sua conta grátis
            </a>
            <p className="mt-4 text-sm text-gray-300">A rede social para quem realmente ama cinema.</p>
          </div>
          {heroMovie && (
            <p className="absolute bottom-5 right-5 text-xs text-white/50 tracking-widest uppercase">
              {heroMovie.title}
            </p>
          )}

          {/* ✅ ÍCONE DE SCROLL COM TRANSIÇÃO DE OPACIDADE */}
          {/* As classes agora controlam a visibilidade e o efeito de fade */}
          <div 
            className={`
              absolute bottom-4 left-1/2 -translate-x-1/2 z-10 
              transition-opacity duration-500 ease-in-out
              ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <div className="flex flex-col items-center text-white/70 animate-bounce">
                <span className="text-xs">Role para ver</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
          </div>

        </div>
        
        <div className="container mx-auto px-12 py-12 space-y-12 bg-gray-900 relative z-10">
          {isLoading ? (
            <div className="space-y-12">
              <SkeletonCarousel />
              <SkeletonCarousel />
            </div>
          ) : (
            <>
              <MovieCarousel title="Lançamentos" movies={nowPlaying} />
              <MovieCarousel title="Melhores Avaliados" movies={topRated} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}