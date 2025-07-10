// arquivo: src/components/layout/Layout.tsx

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../Footer';

export default function Layout() {
  return (
    // ✅ ESTRUTURA CORRIGIDA
    // 1. O div principal agora organiza o layout com Flexbox em coluna.
    // 2. 'min-h-screen' garante que ele ocupe pelo menos a altura inteira da tela.
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* 3. A tag 'main' agora tem 'flex-grow', o que a força a "esticar" 
             e ocupar todo o espaço vertical disponível, empurrando o footer para baixo. */}
       <main className="flex-grow pt-16">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}