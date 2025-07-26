// arquivo: src/components/layout/Header.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlus, FaTimes, FaBars } from 'react-icons/fa';
import AuthModal from '../AuthModal';
import MovieSearchModal from '../MovieSearchModal';
import ReviewModal from '../ReviewModal';
import PosterSelectionModal from '../PosterSelectionModal'; // Importa o novo modal
import { useAuth } from '../../contexts/AuthContext';
import { signIn } from '../../services/authService';
import { Movie } from '../../models/movie';
import { getMovieImages } from '../../services/tmdbService';

// Componente interno para o perfil do usuário, que só renderiza quando necessário
const UserProfileLink = React.memo(() => {
  const { user } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url;
  const username = user?.user_metadata?.username || user?.email;

  return (
    <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar do usuário" className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-600"></div>
      )}
      <span className="font-semibold text-white">{username}</span>
    </Link>
  );
});

export default function Header() {
  const navigate = useNavigate();
  
  // Estado para controlar o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estados para os modais de autenticação
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Estados para controlar o fluxo de adicionar review
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Estados para gerenciar os pôsteres
  const [posters, setPosters] = useState<any[]>([]);
  const [currentPosterPath, setCurrentPosterPath] = useState<string | null>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  const { user, signOut, isLoading } = useAuth();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await signIn(loginIdentifier, loginPassword);
      setShowLoginForm(false);
    } catch (err: any) {
      setLoginError("Credenciais de login inválidas.");
    }
  };

  // Função de seleção de filme ATUALIZADA para buscar imagens
  const handleMovieSelectedForReview = async (movie: Movie) => {
    setSelectedMovie(movie);
    setIsSearchModalOpen(false);
    setCurrentPosterPath(movie.poster_path); // Define o pôster inicial

    try {
      const imagesData = await getMovieImages(movie.id);
      const allPosters = [{ file_path: movie.poster_path }, ...(imagesData.posters || [])];
      const uniquePosters = Array.from(new Set(allPosters.map(p => p.file_path)))
                                 .map(file_path => allPosters.find(p => p.file_path === file_path));
      setPosters(uniquePosters.filter(p => p && p.file_path) as any[]);
    } catch (error) {
      console.error("Erro ao buscar pôsteres:", error);
      setPosters([{ file_path: movie.poster_path }]); // Fallback para o pôster principal
    }
    
    setIsReviewModalOpen(true);
  };

  // Esta função agora abre o modal de seleção
  const openPosterSelection = () => {
    if (posters.length > 1) {
      setIsPosterModalOpen(true);
    }
  };

  // Esta função é chamada pelo PosterSelectionModal quando um pôster é escolhido
  const handlePosterSelected = (path: string) => {
    setCurrentPosterPath(path);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedMovie(null);
    setPosters([]);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await signIn(loginIdentifier, loginPassword);
      setShowLoginForm(false);
      closeMobileMenu();
    } catch (err: any) {
      setLoginError("Credenciais de login inválidas.");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50 py-3 transition-all">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative mr-2">
                <div className="w-6 h-8 bg-pink-500 rounded-sm transform rotate-12 shadow-sm"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-pink-300 rounded-sm transform rotate-12"></div>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-gray-200 text-xl font-bold leading-tight">The 1st rule</div>
                <div className="text-xs text-gray-400 mt-0.5">clube do cinema</div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-5 text-sm">
              <Link to="/films" className="font-semibold text-gray-300 hover:text-white transition-colors">FILMES</Link>
              <Link to="/lists" className="font-semibold text-gray-300 hover:text-white transition-colors">LISTAS</Link>
              <Link to="/members" className="font-semibold text-gray-300 hover:text-white transition-colors">MEMBROS</Link>
            </nav>
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-700 rounded-md animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSearchModalOpen(true)}
                  className="p-2 bg-gray-700 rounded-full text-white hover:bg-cyan-600 transition-colors"
                  title="Adicionar um filme ao seu diário"
                >
                  <FaPlus size={12} />
                </button>
                <div className="h-6 w-px bg-gray-700"></div>
                <UserProfileLink />
                <button onClick={signOut} className="font-semibold text-gray-400 hover:text-white">SAIR</button>
              </div>
            ) : (
              <div className="relative">
                {!showLoginForm && (
                  <div className="flex items-center space-x-5">
                    <a href="#" onClick={(e) => { e.preventDefault(); setLoginError(null); setShowLoginForm(true); }} className="font-semibold text-gray-300 hover:text-white">ENTRAR</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }} className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 font-bold">CRIAR CONTA</a>
                  </div>
                )}
                {showLoginForm && (
                   <div className="flex items-center justify-end w-full gap-2">
                    <button onClick={() => setShowLoginForm(false)} className="p-1.5 text-gray-400 hover:text-white" aria-label="Fechar"><FaTimes size={16} /></button>
                    <div className="relative">
                      <form onSubmit={handleLogin} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Usuário ou Email"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className={`px-2 py-1 w-36 bg-gray-700 border rounded text-white text-xs focus:outline-none focus:ring-1 ${loginError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                        />
                        <input
                          type="password"
                          placeholder="Senha"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`px-2 py-1 w-36 bg-gray-700 border rounded text-white text-xs focus:outline-none focus:ring-1 ${loginError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                        />
                        <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-bold">ENTRAR</button>
                      </form>
                      {loginError && (
                        <div className="absolute top-full mt-2 w-max bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-md shadow-lg left-1/2 -translate-x-1/2">
                          {loginError}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-red-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2 bg-gray-700 rounded-full text-white hover:bg-cyan-600 transition-colors"
                title="Adicionar um filme ao seu diário"
              >
                <FaPlus size={12} />
              </button>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Navigation Links */}
              <nav className="space-y-3">
                <Link 
                  to="/films" 
                  className="block font-semibold text-gray-300 hover:text-white transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  FILMES
                </Link>
                <Link 
                  to="/lists" 
                  className="block font-semibold text-gray-300 hover:text-white transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  LISTAS
                </Link>
                <Link 
                  to="/members" 
                  className="block font-semibold text-gray-300 hover:text-white transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  MEMBROS
                </Link>
              </nav>

              <div className="border-t border-gray-700 pt-4">
                {isLoading ? (
                  <div className="h-8 w-32 bg-gray-700 rounded-md animate-pulse"></div>
                ) : user ? (
                  <div className="space-y-4">
                    <div onClick={closeMobileMenu}>
                      <UserProfileLink />
                    </div>
                    <button 
                      onClick={() => { signOut(); closeMobileMenu(); }} 
                      className="block w-full text-left font-semibold text-gray-400 hover:text-white py-2"
                    >
                      SAIR
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!showLoginForm ? (
                      <div className="space-y-3">
                        <button 
                          onClick={() => { setLoginError(null); setShowLoginForm(true); }} 
                          className="block w-full text-left font-semibold text-gray-300 hover:text-white py-2"
                        >
                          ENTRAR
                        </button>
                        <button 
                          onClick={() => { setIsAuthModalOpen(true); closeMobileMenu(); }} 
                          className="block w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 font-bold text-center"
                        >
                          CRIAR CONTA
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold">Login</span>
                          <button 
                            onClick={() => setShowLoginForm(false)} 
                            className="p-1 text-gray-400 hover:text-white"
                            aria-label="Fechar"
                          >
                            <FaTimes size={16} />
                          </button>
                        </div>
                        <form onSubmit={handleMobileLogin} className="space-y-3">
                          <input
                            type="text"
                            placeholder="Usuário ou Email"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded text-white text-sm focus:outline-none focus:ring-1 ${loginError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                          />
                          <input
                            type="password"
                            placeholder="Senha"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded text-white text-sm focus:outline-none focus:ring-1 ${loginError ? 'border-red-500 ring-red-500' : 'border-gray-600 focus:ring-cyan-500'}`}
                          />
                          <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-bold"
                          >
                            ENTRAR
                          </button>
                        </form>
                        {loginError && (
                          <div className="bg-red-600 text-white text-sm font-semibold px-3 py-2 rounded-md">
                            {loginError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <MovieSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onMovieSelect={handleMovieSelectedForReview}
      />
      
      {selectedMovie && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          onSaveSuccess={handleCloseReviewModal}
          movie={selectedMovie}
          posters={posters}
          currentPosterPath={currentPosterPath || ''}
          onChangePoster={openPosterSelection}
        />
      )}

      {selectedMovie && (
        <PosterSelectionModal
          isOpen={isPosterModalOpen}
          onClose={() => setIsPosterModalOpen(false)}
          movie={selectedMovie}
          posters={posters}
          onPosterSelect={handlePosterSelected}
        />
      )}
    </>
  );
}