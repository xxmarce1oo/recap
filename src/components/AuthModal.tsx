// arquivo: src/components/AuthModal.tsx

import { Dialog } from '@headlessui/react'
import { useState, FormEvent } from 'react'
import { FaCircle, FaEnvelope, FaLock, FaUser } from 'react-icons/fa' // Adicionado FaUser

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  // Estados para controlar os inputs do formulário
  const [username, setUsername] = useState(''); // Adicionado campo de usuário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // ✅ A lógica de autenticação (Firebase, Supabase, etc.) para criar um novo usuário virá aqui
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    console.log('Tentativa de registro com:', { username, email, password });
    // onClose(); // Opcional: fechar o modal após um registro bem-sucedido
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Container do Modal */}
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-gray-800 p-8 shadow-2xl">
          
          {/* Logo e Título */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center space-x-2">
              <FaCircle className="text-red-700 text-2xl" />
              <h2 className="text-2xl font-bold text-white">RECAP</h2>
            </div>
            <Dialog.Title className="text-lg font-medium text-gray-300 mt-2">
              Crie sua conta para começar
            </Dialog.Title>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo de Nome de Usuário */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaUser className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400"
                placeholder="Nome de usuário"
                required
              />
            </div>

            {/* Campo de Email */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            {/* Campo de Senha */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400"
                placeholder="Senha"
                required
              />
            </div>
            
            {/* Campo de Confirmar Senha */}
            <div className="relative">
               <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="h-5 w-5 text-gray-500" />
              </span>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-gray-700 text-white placeholder-gray-400"
                placeholder="Confirme sua senha"
                required
              />
            </div>
            
            {/* Botão de Criar Conta */}
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors"
            >
              Criar Conta
            </button>
          </form>
          
          {/* O link para alternar foi removido */}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}