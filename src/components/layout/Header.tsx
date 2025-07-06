// arquivo: src/components/layout/Header.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCircle } from 'react-icons/fa';
import AuthModal from '../AuthModal';

export default function Header() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // ✅ 1. Novo estado para controlar a exibição do formulário de login
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede que o link navegue
    setShowLoginForm(!showLoginForm); // Alterna a visibilidade do formulário
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50 py-3 transition-all">
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          {/* Logo e Links Principais */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FaCircle className="text-red-700 text-lg" />
              <div className="text-xl font-bold text-white">RECAP</div>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <Link to="/films" className="font-semibold text-gray-300 hover:text-white transition-colors">FILMES</Link>
              <Link to="/lists" className="font-semibold text-gray-300 hover:text-white transition-colors">LISTAS</Link>
              <Link to="/members" className="font-semibold text-gray-300 hover:text-white transition-colors">MEMBROS</Link>
            </nav>
          </div>

          {/* ✅ 2. Nova estrutura de autenticação à direita */}
          <div className="flex items-center space-x-6 text-sm">
            {/* Formulário de Login Embutido */}
            {showLoginForm && (
              <form className="hidden md:flex items-center space-x-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="px-2 py-1 w-36 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  className="px-2 py-1 w-36 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-bold">
                  ENTRAR
                </button>
              </form>
            )}

            {/* Links de Ação */}
            <a href="#" onClick={handleSignInClick} className="font-semibold text-gray-300 hover:text-white transition-colors">
              ENTRAR
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }}
              className="px-4 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors font-bold"
            >
              CRIAR CONTA
            </a>
            {/* Campo de Busca (a ser implementado) */}
            {/* <input type="search" placeholder="Buscar..." /> */}
          </div>
        </div>
      </header>
      {/* O modal de registro continua funcionando como antes */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}