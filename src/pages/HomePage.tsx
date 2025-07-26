// arquivo: src/pages/HomePage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCarousel from '../components/MovieCarousel';
import SkeletonCarousel from '../components/SkeletonCarousel';
import { useHomePageViewModel } from '../viewmodels/useHomePageViewModel';
import { useAuth } from '../contexts/AuthContext';
import { getContentBasedRecommendations } from '../services/recommendationService';
import { Movie } from '../models/movie';
import { FaArrowRight } from 'react-icons/fa';

interface Update {
  message: string;
  color?: string;
}

export default function HomePage() {
  const { nowPlaying, topRated, heroMovie, isLoading, error } = useHomePageViewModel();
  const { user } = useAuth();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [latestUpdate, setLatestUpdate] = useState<Update | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoadingRecommendations(true);
      getContentBasedRecommendations(user.id, 6)
        .then(setRecommendations)
        .catch(err => console.error("Erro ao buscar recomendações:", err))
        .finally(() => setIsLoadingRecommendations(false));
      
      fetch('/updates.json')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setLatestUpdate(data[0]);
          }
        })
        .catch(err => console.error("Erro ao buscar updates.json:", err));

    } else {
        setRecommendations([]);
        setIsLoadingRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIndicator(window.scrollY <= 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-400">
        <div>
          <p className="text-lg font-semibold">Ocorreu um erro</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* --- SEÇÃO HERO --- */}
      <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: heroMovie ? `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` : 'none',
            backgroundColor: '#111827'
          }}
        />
        <div className="absolute inset-0 w-full h-full bg-black/60" />

        <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center text-white px-4 sm:px-6">
          {isLoading ? (
            <p>Carregando...</p>
          ) : user ? (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Bem-vindo de volta, <span className="text-cyan-400">{user.user_metadata?.username || 'Cinéfilo'}</span>!
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Sentimos sua falta. Explore as últimas novidades ou veja o que separamos para você.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
                <Link to="/watchlist" className="px-4 sm:px-6 py-2 border-2 border-cyan-500 text-cyan-500 font-semibold rounded-lg hover:bg-cyan-500 hover:text-white transition-colors text-sm sm:text-base">
                  Minha Watchlist
                </Link>
                <Link to="/lists" className="px-4 sm:px-6 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors text-sm sm:text-base">
                  Minhas Listas
                </Link>
              </div>

              {latestUpdate && (
                <div className="mt-8 sm:mt-10">
                  <Link to="/updates" className="group inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-800/80 hover:border-gray-600 transition-all">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${latestUpdate.color} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 ${latestUpdate.color}`}></span>
                    </span>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-semibold text-white">Última atualização</p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{latestUpdate.message}</p>
                    </div>
                    <FaArrowRight className="text-gray-500 group-hover:text-cyan-400 transition-colors text-xs sm:text-sm" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Seu universo cinematográfico, <br className="hidden sm:block" /> mais inteligente.
              </h1>
              <h2 className="mt-4 text-lg sm:text-xl md:text-2xl font-light max-w-3xl px-4" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Vá além de organizar filmes. Receba <strong className="font-semibold text-cyan-300">recomendações personalizadas</strong> e converse com nossa <strong className="font-semibold text-cyan-300">IA especialista</strong> para encontrar seu próximo filme favorito.
              </h2>
              <a href="#" onClick={(e) => { e.preventDefault(); }} className="mt-6 sm:mt-8 bg-cyan-500 hover:bg-cyan-600 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-colors">
                Crie sua conta grátis
              </a>
            </>
          )}
        </div>
        
        {heroMovie && (
          <p className="absolute bottom-5 right-5 text-xs text-white/50 tracking-widest uppercase z-10">
            {heroMovie.title}
          </p>
        )}

        <div 
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-opacity duration-500 ease-in-out ${showScrollIndicator ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-col items-center text-white/70 animate-gentle-bounce">
              <span className="text-xs">Role para ver</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>
      
      {/* Container geral para os carrosséis com margens laterais */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 space-y-8 sm:space-y-12 bg-gray-900 relative z-10">
        
        {user && (
            isLoadingRecommendations ? (
                <SkeletonCarousel />
            ) : recommendations.length > 0 ? (
                <MovieCarousel title="Recomendações para Você" movies={recommendations} />
            ) : (
                <div className="text-center p-6 sm:p-8 bg-gray-800/50 rounded-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Descubra novos filmes!</h3>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">
                        Avalie os filmes que você assiste para receber recomendações personalizadas aqui.
                    </p>
                </div>
            )
        )}

        {isLoading ? (
          <div className="space-y-8 sm:space-y-12">
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