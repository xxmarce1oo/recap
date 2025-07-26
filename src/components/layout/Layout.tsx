// arquivo: src/components/layout/Layout.tsx (Sugestão de melhoria)

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* Container responsivo com padding ajustável */}
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}