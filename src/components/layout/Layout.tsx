// arquivo: src/components/layout/Layout.tsx

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from '../Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}