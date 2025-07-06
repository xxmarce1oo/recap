// arquivo: src/components/layout/Footer.tsx

import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // O fundo agora é um cinza um pouco mais escuro para uma separação sutil
    <footer className="bg-gray-950 text-gray-500">
      <div className="container mx-auto px-6 md:px-12 py-8">
        
        {/* Links Principais Centralizados */}
        <div className="flex justify-center space-x-6">
          <Link to="/about" className="text-sm hover:text-white transition-colors">Sobre</Link>
          <Link to="/terms" className="text-sm hover:text-white transition-colors">Termos</Link>
          <Link to="/contact" className="text-sm hover:text-white transition-colors">Contato</Link>
        </div>

        {/* Linha de Copyright e Atribuição */}
        <div className="text-center mt-6">
          <p className="text-xs">&copy; {currentYear} Recap. Todos os direitos reservados.</p>
          <p className="text-xs mt-1">
            Este produto usa a API do TMDb, mas não é endossado ou certificado pelo <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">TMDb</a>.
          </p>
        </div>

      </div>
    </footer>
  );
}