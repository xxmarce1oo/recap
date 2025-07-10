// arquivo: src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import AboutPage from './pages/AboutPage'
import UserProfilePage from './pages/UserProfilePage'
import ListPage from './pages/ListPage'
import WatchlistPage from './pages/WatchlistPage' // Importe a página
import DiaryPage from './pages/DiaryPage' // Importe a página
import MovieDiaryPage from './pages/MovieDiaryPage' // Importe a página
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'
import MembersPage from './pages/MembersPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'movies/:listType',
        element: <ListPage />,
      },
      {
        path: 'movie/:id',
        element: <MovieDetailsPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'profile',
        element: <UserProfilePage />,
      },
      { // ✅ ADICIONAR ESTA NOVA ROTA
        path: 'diary', 
        element: <DiaryPage />
      },
      { // ✅ ADICIONAR ESTA NOVA ROTA
        path: 'movie/:id/diary', 
        element: <MovieDiaryPage />
      },
      {
        path: 'profile/:username', // Aceita um nome de utilizador na URL
        element: <UserProfilePage />,
      },
      {
        path: 'members',
        element: <MembersPage />,
      },
      // Adicione a nova rota da watchlist aqui
      {
        path: 'watchlist',
        element: <WatchlistPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)