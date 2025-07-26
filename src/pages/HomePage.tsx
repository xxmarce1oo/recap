// arquivo: src/pages/HomePage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCarousel from '../components/MovieCarousel';
import SkeletonCarousel from '../components/SkeletonCarousel';
import { useHomePageViewModel } from '../viewmodels/useHomePageViewModel';
import { useAuth } from '../contexts/AuthContext';
import { Movie } from '@/models/movie';
import { getContentBasedRecommendations } from '../services/recommendationService'; // MUDANÇA AQUI

export default function HomePage() {
  const { nowPlaying, topRated, heroMovie, isLoading, error } = useHomePageViewModel();
  const { user } = useAuth();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [recommendations, setRecommendations] = useState<Movie[]>([]); // MUDANÇA AQUI
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

useEffect(() => {
    if (user) {
      setIsLoadingRecommendations(true);
      getContentBasedRecommendations(user.id, 6) // MUDANÇA AQUI
        .then(setRecommendations)
        .catch(err => console.error("Erro ao buscar recomendações:", err))
        .finally(() => setIsLoadingRecommendations(false));
    } else {
      setIsLoadingRecommendations(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold">Ocorreu um erro</p>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* --- SEÇÃO HERO UNIFICADA --- */}
      {/* ✅ A MUDANÇA ESTÁ AQUI: a altura foi ajustada para considerar o header */}
      <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col"> {/* 4rem = 64px (altura do header pt-16) */}
        {/* Camada 1: Imagem de Fundo */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: heroMovie ? `url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` : 'none',
            backgroundColor: '#111827' // Cor de fundo para o caso de não haver imagem
          }}
        />
        {/* Camada 2: Overlay escuro para contraste */}
        <div className="absolute inset-0 w-full h-full bg-black/60" />

        {/* Camada 3: Conteúdo Central (ocupa o espaço disponível) */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-grow text-center text-white px-4">
          {isLoading ? (
            <p>Carregando...</p>
          ) : user ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Bem-vindo de volta, <span className="text-cyan-400">{user.user_metadata?.username || 'Cinéfilo'}</span>!
              </h1>
              <p className="mt-4 text-lg text-gray-300 max-w-2xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Sentimos sua falta. Explore as últimas novidades ou veja o que separamos para você.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Link to="/watchlist" className="px-6 py-2 border-2 border-cyan-500 text-cyan-500 font-semibold rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
                  Minha Watchlist
                </Link>
                <Link to="/lists" className="px-6 py-2 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-colors">
                  Minhas Listas
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                Seu universo cinematográfico, <br /> mais inteligente.
              </h1>
              <h2 className="mt-4 text-xl md:text-2xl font-light max-w-3xl" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}>
                Vá além de organizar filmes. Receba <strong className="font-semibold text-cyan-300">recomendações personalizadas</strong> e converse com nossa <strong className="font-semibold text-cyan-300">IA especialista</strong> para encontrar seu próximo filme favorito.
              </h2>
              <a href="#" onClick={(e) => { e.preventDefault(); /* Lógica para abrir modal de cadastro */ }} className="mt-8 bg-cyan-500 hover:bg-cyan-600 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
                Crie sua conta grátis
              </a>
            </>
          )}
        </div>
        
        {/* Nome do filme sutil no canto */}
        {heroMovie && (
          <p className="absolute bottom-5 right-5 text-xs text-white/50 tracking-widest uppercase z-10">
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
        
              {/* Carrossel de Recomendações */}
        {user && (
            isLoadingRecommendations ? (
                <SkeletonCarousel />
            ) : recommendations.length > 0 ? (
                <MovieCarousel title="Recomendações para Você" movies={recommendations} />
            ) : (
                // ✅ NOVA MENSAGEM DE FALLBACK
                <div className="text-center p-8 bg-gray-800/50 rounded-lg">
                    <h3 className="text-xl font-bold text-white">Descubra novos filmes!</h3>
                    <p className="text-gray-400 mt-2">
                        Avalie os filmes que você assiste para receber recomendações personalizadas aqui.
                    </p>
                </div>
            )
        )}

        {/* Carrosséis existentes */}
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