// arquivo: src/components/layout/Header.tsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCircle, FaTimes } from 'react-icons/fa';
import AuthModal from '../AuthModal';

export default function Header() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLoginForm(true);
  };

  const handleCloseLoginForm = () => {
    setShowLoginForm(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50 py-1 transition-all">
        {/* Container com altura fixa h-12(40px) */}
        <div className="container mx-auto px-4 h-12 flex justify-between items-center">
          
          {/* Lado Esquerdo: Logo e Links Principais */}
          <div className="flex items-center space-x-6">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FaCircle className="text-red-700 text-lg" />
              <div className="text-xl font-bold text-white">RECAP</div>
            </div>
            <nav className="hidden md:flex items-center space-x-5 text-sm">
              <Link to="/films" className="font-semibold text-gray-300 hover:text-white transition-colors">FILMES</Link>
              <Link to="/lists" className="font-semibold text-gray-300 hover:text-white transition-colors">LISTAS</Link>
              <Link to="/members" className="font-semibold text-gray-300 hover:text-white transition-colors">MEMBROS</Link>
            </nav>
          </div>

          {/* Lado Direito: Área de Autenticação */}
          <div className="flex items-center space-x-4 text-sm">
            
            {/* Estado Padrão (Formulário Escondido) */}
            {!showLoginForm && (
              <div className="flex items-center space-x-5">
                <a href="#" onClick={handleSignInClick} className="font-semibold text-gray-300 hover:text-white transition-colors">
                  ENTRAR
                </a>
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors font-bold"
                >
                  CRIAR CONTA
                </a>
              </div>
            )}
            
            {/* Estado Ativo (Formulário Visível) */}
            {showLoginForm && (
              <div className="flex items-center justify-end w-full gap-4">
                
                {/* ✅ O 'X' agora vem primeiro */}
                <button 
                  onClick={handleCloseLoginForm} 
                  className="p-0.1 text-gray-400 hover:text-white"
                  aria-label="Fechar formulário de login"
                >
                  <FaTimes size={16} />
                </button>

                {/* Formulário de Login */}
                <form className="hidden md:flex items-center space-x-2">
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="px-2 py-1 w- bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-700"
                  />
                  <input 
                    type="password" 
                    placeholder="Senha" 
                    className="px-2 py-1 w-32 bg-gray-700 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-700"
                  />
                  <button type="submit" className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs font-bold">
                    ENTRAR
                  </button>
                </form>

                {/* Link "Esqueci minha senha" */}
                <a href="#" className="text-xs text-gray-400 hover:text-white whitespace-nowrap">
                  Esqueci minha senha
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}