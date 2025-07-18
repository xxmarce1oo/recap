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
import FollowersPage from './pages/FollowersPage'
import FollowingPage from './pages/FollowingPage'
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

      { path: 'profile/:username/followers', element: <FollowersPage /> },
      { path: 'profile/followers', element: <FollowersPage /> }, // Rota para os próprios seguidores
      { path: 'profile/:username/following', element: <FollowingPage /> },
      { path: 'profile/following', element: <FollowingPage /> }, // Rota para quem o próprio usuário segue
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