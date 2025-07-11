// arquivo: src/components/layout/Header.tsx

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import AuthModal from '../AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { signIn } from '../../services/authService';

export default function Header() {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const { user, signOut, isLoading } = useAuth();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  console.log('[Header] Renderizando com os valores do contexto:', { isLoading, user });
  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginError(null);
    setShowLoginForm(true);
  };

  const handleCloseLoginForm = () => {
    setShowLoginForm(false);
    setLoginError(null);
  };

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

  // ✅ Pega a URL do avatar dos metadados do usuário
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 z-50 py-3 transition-all">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              {/* Ícone do sabonete */}
              <div className="relative mr-2">
                <div className="w-6 h-8 bg-pink-500 rounded-sm transform rotate-12 shadow-sm"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-6 bg-pink-300 rounded-sm transform rotate-12"></div>
              </div>

              <div className="flex flex-col items-start">
                <div className="text-gray-200 text-xl font-bold leading-tight">The 1st rule</div>
                <div className="text-xs text-gray-400 mt-0.5">clube do cinema</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-5 text-sm">
              <Link to="/films" className="font-semibold text-gray-300 hover:text-white transition-colors">FILMES</Link>
              <Link to="/lists" className="font-semibold text-gray-300 hover:text-white transition-colors">LISTAS</Link>
              <Link to="/members" className="font-semibold text-gray-300 hover:text-white transition-colors">MEMBROS</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            {isLoading ? (
              <div className="h-6 w-24 bg-gray-700 rounded-md animate-pulse"></div>
            ) : user ? (
              // ✅ O link do perfil agora mostra a imagem do avatar
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar do usuário" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-600"></div>
                  )}
                  <span className="font-semibold text-white">{user.user_metadata?.username || user.email}</span>
                </Link>
                <button onClick={signOut} className="font-semibold text-gray-400 hover:text-white">SAIR</button>
              </div>
            ) : (
              <div className="relative">
                {!showLoginForm && (
                  <div className="flex items-center space-x-5">
                    <a href="#" onClick={handleSignInClick} className="font-semibold text-gray-300 hover:text-white">ENTRAR</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsAuthModalOpen(true); }} className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600 font-bold">CRIAR CONTA</a>
                  </div>
                )}
                {showLoginForm && (
                  <div className="flex items-center justify-end w-full gap-2">
                    <button onClick={handleCloseLoginForm} className="p-1.5 text-gray-400 hover:text-white" aria-label="Fechar"><FaTimes size={16} /></button>
                    <div className="relative">
                      <form onSubmit={handleLogin} className="hidden md:flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Email"
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
                    <a href="#" className="text-xs text-gray-400 hover:text-white whitespace-nowrap">Esqueci a senha</a>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}