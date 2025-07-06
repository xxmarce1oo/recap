// MovieDetailsPage.tsx

import { useParams, useNavigate } from 'react-router-dom'
import { getMovieDetails, getMovieProviders, getMovieVideos, getMovieCredits, getMovieReleaseDates, getMovieImages } from '../services/tmdbService'
import { useEffect, useState } from 'react'
import { Movie } from '../models/movie'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [credits, setCredits] = useState<any>(null)
  const [releaseDates, setReleaseDates] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllProviders, setShowAllProviders] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const [backdrops, setBackdrops] = useState<any[]>([]);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

// ONDE: Substitua todo o seu bloco 'useEffect' por este.
useEffect(() => {
  const fetchMovieData = async () => {
    try {
      setLoading(true)
      // Carrega todos os dados em paralelo para mais eficiência
      const [
        movieData,
        providersData,
        videosData,
        creditsData,
        releaseDatesData,
        imagesData,
      ] = await Promise.all([
        getMovieDetails(Number(id)),
        getMovieProviders(Number(id)),
        getMovieVideos(Number(id)),
        getMovieCredits(Number(id)),
        getMovieReleaseDates(Number(id)),
        getMovieImages(Number(id)), // Busca as imagens
      ]);
      
      // Atualiza todos os estados
      setMovie(movieData)
      setCredits(creditsData)
      setReleaseDates(releaseDatesData)
      setProviders(providersData)
      setVideos(videosData.filter((video: any) => video.type === 'Trailer'))
      setBackdrops(imagesData); // Guarda a lista de backdrops
    } catch (err) {
      setError('Failed to load movie details')
    } finally {
      setLoading(false)
    }
  }

  fetchMovieData()
}, [id])

const changeBackdrop = () => {
  if (backdrops.length > 1) {
    const nextIndex = (currentBackdropIndex + 1) % backdrops.length;
    setCurrentBackdropIndex(nextIndex);
  }
};

  const groupedProviders = {
    stream: providers.filter(p => p.type === 'flatrate'),
    rent: providers.filter(p => p.type === 'rent'),
    buy: providers.filter(p => p.type === 'buy')
  }

  const mockReviews = [
    { id: 1, author: "João Silva", content: "Excelente filme, atuações incríveis!", rating: 4.5 },
    { id: 2, author: "Maria Souza", content: "Uma obra prima do cinema moderno.", rating: 5 },
    { id: 3, author: "Carlos Oliveira", content: "Bom, mas esperava mais da sequência.", rating: 3.5 }
  ]

  if (loading) return <div className="min-h-screen bg-gray-900 text-gray-100 p-4">Loading...</div>
  if (error) return <div className="min-h-screen bg-gray-900 text-gray-100 p-4">{error}</div>
  if (!movie) return <div className="min-h-screen bg-gray-900 text-gray-100 p-4">Movie not found</div>

  const formattedDate = movie.release_date ? format(new Date(movie.release_date), 'dd/MM/yyyy', { locale: ptBR }) : ''

  const currentBackdropPath = backdrops[currentBackdropIndex]?.file_path || movie.backdrop_path;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="relative">
        <div 
          className="w-full h-[500px] bg-cover bg-top -mt-1"
          style={{
            backgroundImage: `
            linear-gradient(to top, rgba(17, 24, 39, 1) 0%, rgba(17, 24, 39, 0.5) 30%, transparent 100%),
            url(https://image.tmdb.org/t/p/original${currentBackdropPath})
            `,
        }}
        />
        {/* O botão só aparece se a condição abaixo for verdadeira */}
        {backdrops.length > 1 && (
          <button
            onClick={changeBackdrop}
            className="fixed top-20 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors z-50"
            aria-label="Trocar imagem de fundo"
          >
            {/* Ícone de atualização (SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 013.5 9" />
            </svg>
          </button>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 -mt-64"> 
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg z-10 relative mb-8"
            />
            {providers.length === 0 ? (
              <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">Onde Assistir</h2>
                <p className="text-sm text-gray-400">Este filme não está disponível em nenhum serviço de streaming no momento.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 bg-gray-800 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3">Onde Assistir</h2>
                  {groupedProviders.stream.length > 0 && (
                    <div className="space-y-2">
                      {groupedProviders.stream.map(provider => (
                        <ProviderItem key={provider.provider_id} provider={provider} id={id} />
                      ))}
                    </div>
                  )}
                  {groupedProviders.rent.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h3 className="text-md font-medium">Alugar</h3>
                      {groupedProviders.rent.map(provider => (
                        <ProviderItem key={provider.provider_id} provider={provider} id={id} />
                      ))}
                    </div>
                  )}
                  {groupedProviders.buy.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h3 className="text-md font-medium">Comprar</h3>
                      {groupedProviders.buy.map(provider => (
                        <ProviderItem key={provider.provider_id} provider={provider} id={id} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {videos.length > 0 && (
              <a 
                href={`https://www.youtube.com/watch?v=${videos[0].key}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
              >
                Assistir Trailer
              </a>
            )}
          </div>
          <div className="md:w-3/4 relative z-10 pt-48">
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{movie.title}</h1>
            <div className="flex items-center gap-4 mb-4 text-white">
              <span className="flex items-center gap-1 text-yellow-400">
                ★ {movie.vote_average.toFixed(1)}
              </span>
              <span>{movie.runtime} minutos</span>
              <span>{new Date(movie.release_date).toLocaleDateString('pt-BR')}</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm">{movie.overview}</p>
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Gêneros</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-6 flex gap-4">
              <button onClick={() => toggleSection('cast')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">Elenco</button>
              <button onClick={() => toggleSection('crew')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">Equipe Técnica</button>
              <button onClick={() => toggleSection('release')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">Datas de Lançamento</button>
            </div>
            {expandedSection === 'cast' && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Elenco Principal</h3>
                {credits?.cast.slice(0, 10).map((person: any) => (
                  <div key={person.id} className="mb-2">
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-400">{person.character || 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
            {expandedSection === 'crew' && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Equipe Técnica</h3>
                {credits?.crew.filter((person: any) => ['Director', 'Writer', 'Producer'].includes(person.job)).slice(0, 10).map((person: any) => (
                    <div key={person.id} className="mb-2">
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-gray-400">{person.job}</p>
                    </div>
                ))}
              </div>
            )}
            {expandedSection === 'release' && (
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Datas de Lançamento</h3>
                {releaseDates?.filter((country: any) => country.release_dates?.length > 0).map((country: any) => (
                    <div key={country.iso_3166_1} className="mb-2">
                      <p className="font-medium">{country.iso_3166_1}</p>
                      <p className="text-sm text-gray-400">{new Date(country.release_dates[0].release_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                ))}
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Avaliações</h2>
              <div className="space-y-4">
                {mockReviews.map(review => (
                  <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{review.author}</h3>
                      <span className="flex items-center text-yellow-400 text-sm">★ {review.rating}/10</span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProviderItem = ({ provider, id }: { provider: any, id: string | undefined }) => {
  const providerDetails = provider.provider || provider
  
  return (
    <div className="flex items-center gap-3">
      {providerDetails.logo_path && (
        <img 
          src={`https://image.tmdb.org/t/p/original${providerDetails.logo_path}`} 
          alt={providerDetails.provider_name || providerDetails.name}
          className="w-6 h-6 rounded-sm object-cover"
          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{providerDetails.provider_name || providerDetails.name}</p>
      </div>
      <a href={`https://www.themoviedb.org/movie/${id}/watch?locale=BR`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Ver</a>
    </div>
  )
}