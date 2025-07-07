// arquivo: src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import MovieDetailsPage from './pages/MovieDetailsPage'
import AboutPage from './pages/AboutPage'
import UserProfilePage from './pages/UserProfilePage'
import ListPage from './pages/ListPage' // ✅ 1. Importe a nova página

import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // ✅ 2. Adicione a nova rota dinâmica aqui
      {
        path: 'movies/:listType', // ex: /movies/now_playing ou /movies/top_rated
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