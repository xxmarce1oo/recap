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
import WatchlistPage from './pages/WatchlistPage'
import MembersPage from './pages/MembersPage' // ✅ Importar a página
// import MovieDiaryPage from './pages/MovieDiaryPage'
import DiaryPage from './pages/DiaryPage'

import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'movies/:listType', element: <ListPage /> },
      { path: 'movie/:id', element: <MovieDetailsPage /> },
      // { path: 'movie/:id/diary', element: <MovieDiaryPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'diary', element: <DiaryPage /> },
      { path: 'watchlist', element: <WatchlistPage /> },
      
      // ✅ ROTA DE MEMBROS ADICIONADA
      {
        path: 'members',
        element: <MembersPage />,
      },
      
      { path: 'profile/:username', element: <UserProfilePage /> },
      { path: 'profile', element: <UserProfilePage /> },
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