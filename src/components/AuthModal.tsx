// arquivo: src/components/AuthModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, FormEvent } from 'react';
import { FaCircle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
// ✅ Importe a nova função de cadastro
import { signUp } from '../services/authService';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para feedback ao usuário
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Chama a função do nosso serviço de autenticação
      await signUp(email, password, username);
      setSuccess(true); // Mostra a mensagem de sucesso
    } catch (err: any) {
      setError(err.message); // Mostra o erro retornado pelo Supabase
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 shadow-2xl">
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center space-x-2">
              <FaCircle className="text-red-700 text-2xl" />
              <h2 className="text-2xl font-bold text-white">RECAP</h2>
            </div>
            <Dialog.Title className="text-lg font-medium text-gray-300 mt-2">
              Crie sua conta para começar
            </Dialog.Title>
          </div>
          
          {/* ✅ Se o cadastro for bem-sucedido, mostra uma mensagem */}
          {success ? (
            <div className="text-center text-green-400">
              <h3 className="font-bold">Cadastro realizado com sucesso!</h3>
              <p className="text-sm mt-2">Enviamos um e-mail de confirmação para você. Por favor, verifique sua caixa de entrada.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seus inputs continuam aqui, sem alterações */}
              <div className="relative"> <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaUser className="h-5 w-5 text-gray-500" /></span><input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400" placeholder="Nome de usuário" required /></div>
              <div className="relative"> <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaEnvelope className="h-5 w-5 text-gray-500" /></span><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400" placeholder="seu@email.com" required /></div>
              <div className="relative"> <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaLock className="h-5 w-5 text-gray-500" /></span><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400" placeholder="Senha" required /></div>
              <div className="relative"> <span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaLock className="h-5 w-5 text-gray-500" /></span><input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400" placeholder="Confirme sua senha" required /></div>
              
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors disabled:opacity-50">
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>

              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            </form>
          )}

        </Dialog.Panel>
      </div>
    </Dialog>
  );
}