// arquivo: src/pages/HomePage.tsx

import { useState, useEffect } from 'react';
import MovieCarousel from '../components/MovieCarousel';
import SkeletonCarousel from '../components/SkeletonCarousel';
import { useHomePageViewModel } from '../viewmodels/useHomePageViewModel';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { nowPlaying, topRated, heroMovie, isLoading, error } = useHomePageViewModel();
  const { user } = useAuth();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // O indicador agora só some após rolar 200 pixels
      if (window.scrollY > 200) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="mt-24 text-center text-red-400">
          <p className="text-lg font-semibold">Ocorreu um erro</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* --- SEÇÃO HERO UNIFICADA --- */}
      <div className="relative w-full h-screen">
        {/* Camada 1: Imagem de Fundo */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(https://image.tmdb.org/t/p/original${heroMovie?.backdrop_path})`
          }}
        />
        {/* Camada 2: Overlay escuro para contraste */}
        <div className="absolute inset-0 w-full h-full bg-black/60" />

        {/* Camada 3: Conteúdo Central (renderizado condicionalmente) */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          {user ? (
            // --- CONTEÚDO PARA USUÁRIO LOGADO ---
            <>
              <h1 className="text-4xl md:text-5xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Bem-vindo de volta, <span className="text-cyan-400">{user.user_metadata?.username || 'Cinéfilo'}</span>!
              </h1>
              <p className="mt-4 text-lg text-gray-300 max-w-2xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Sentimos sua falta. Explore as últimas novidades ou veja o que separamos para você.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <a href="/watchlist" className="px-6 py-2 border-2 border-cyan-500 text-cyan-500 font-semibold rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
                  Minha Watchlist
                </a>
                <a href="/ask-ai" className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors">
                  Perguntar à IA
                </a>
              </div>
            </>
          ) : (
            // --- CONTEÚDO PARA VISITANTES ---
            <>
              <h1 className="text-4xl md:text-6xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Seu universo cinematográfico, <br /> mais inteligente.
              </h1>
              <h2 className="mt-4 text-xl md:text-2xl font-light max-w-3xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Vá além de organizar filmes. Receba <strong className="font-semibold text-cyan-300">recomendações personalizadas</strong> e converse com nossa <strong className="font-semibold text-cyan-300">IA especialista</strong> para encontrar seu próximo filme favorito.
              </h2>
              <a href="/register" className="mt-8 bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Crie sua conta grátis
              </a>
            </>
          )}
        </div>
        
        {/* Nome do filme sutil no canto */}
        {heroMovie && (
          <p className="absolute bottom-5 right-5 text-xs text-white/50 tracking-widest uppercase">
            {heroMovie.title}
          </p>
        )}

        {/* Indicador de Scroll com a nova animação suave */}
        <div 
          className={`
            absolute bottom-4 left-1/2 -translate-x-1/2 z-10 
            transition-opacity duration-500 ease-in-out
            ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="flex flex-col items-center text-white/70 animate-gentle-bounce">
              <span className="text-xs">Role para ver</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
      
      {/* Container dos Carrosséis */}
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
  );
}