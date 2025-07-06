// arquivo: src/components/layout/Header.tsx

import { useNavigate } from 'react-router-dom'
import { FaSignInAlt, FaUserPlus, FaCircle } from 'react-icons/fa'
import { useState } from 'react'
import AuthModal from '../AuthModal'

export default function Header() {
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900 shadow-md z-50 py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <FaCircle className="text-red-500 text-xl" />
          <div className="text-xl font-bold text-gray-100">
            RECAP
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* O botão de troca de tema foi removido daqui */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            <FaSignInAlt size={14} />
            <span>Login</span>
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            <FaUserPlus size={14} />
            <span>Cadastre-se</span>
          </button>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  )
}