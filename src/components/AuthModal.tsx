import { Dialog } from '@headlessui/react'
import { useState } from 'react'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {isLogin ? 'Login' : 'Cadastre-se'}
          </Dialog.Title>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            )}
            
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? (
              <span>
                Não tem uma conta?{' '}
                <button 
                  onClick={() => setIsLogin(false)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Cadastre-se
                </button>
              </span>
            ) : (
              <span>
                Já tem uma conta?{' '}
                <button 
                  onClick={() => setIsLogin(true)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Faça login
                </button>
              </span>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
