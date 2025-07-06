// arquivo: src/pages/MovieDetailsPage.tsx

import { useParams } from 'react-router-dom';
import { getMovieDetails, getMovieProviders, getMovieVideos, getMovieCredits, getMovieReleaseDates, getMovieImages } from '../services/tmdbService';
import { useEffect, useState } from 'react';
import { Movie } from '../models/movie';
import { IoIosImages } from 'react-icons/io';
import MovieActions from '../components/MovieActions'; 
import ReviewModal from '../components/ReviewModal';

const ProviderItem = ({ provider, id }: { provider: any, id: string | undefined }) => {
    const providerDetails = provider.provider || provider;
    return (
        <div className="flex items-center gap-3">
          {providerDetails.logo_path && ( <img src={`https://image.tmdb.org/t/p/original${providerDetails.logo_path}`} alt={providerDetails.provider_name || providerDetails.name} className="w-8 h-8 rounded-md object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} /> )}
          <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{providerDetails.provider_name || providerDetails.name}</p></div>
          <a href={`https://www.themoviedb.org/movie/${id}/watch?locale=BR`} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline">Ver</a>
        </div>
      );
}

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<any>(null);
  const [releaseDates, setReleaseDates] = useState<any[]>([]); // ✅ Garante que o estado seja populado corretamente
  const [providers, setProviders] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [backdrops, setBackdrops] = useState<any[]>([]);
  const [currentBackdropIndex, setCurrentBackdropIndex] = useState(0);
  const [posters, setPosters] = useState<any[]>([]);
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); 
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [
          movieData, providersData, videosData,
          creditsData, releaseDatesData, imagesData
        ] = await Promise.all([
          getMovieDetails(Number(id)), getMovieProviders(Number(id)),
          getMovieVideos(Number(id)), getMovieCredits(Number(id)),
          getMovieReleaseDates(Number(id)), getMovieImages(Number(id)),
        ]);
        
        setMovie(movieData);
        setCredits(creditsData);
        setReleaseDates(releaseDatesData.results); // ✅ Garante que o estado seja populado corretamente
        setProviders(providersData);
        setVideos(videosData.filter((video: any) => video.type === 'Trailer'));
        setBackdrops(imagesData.backdrops || []);
        setPosters(imagesData.posters || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id]);

  const changeBackdrop = () => {
    if (backdrops.length > 1) {
      setCurrentBackdropIndex((prevIndex) => (prevIndex + 1) % backdrops.length);
    }
  };

  const changePoster = () => {
    if (posters.length > 1) {
      setCurrentPosterIndex((prevIndex) => (prevIndex + 1) % posters.length);
    }
  };
  
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><p>Carregando...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><p>{error}</p></div>;
  if (!movie) return <div className="flex justify-center items-center h-screen"><p>Filme não encontrado.</p></div>;

  const currentBackdropPath = backdrops[currentBackdropIndex]?.file_path || movie.backdrop_path;
  const currentPosterPath = posters[currentPosterIndex]?.file_path || movie.poster_path;
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  
  const groupedProviders = {
    stream: providers.filter(p => p.type === 'flatrate'),
    rent: providers.filter(p => p.type === 'rent'),
    buy: providers.filter(p => p.type === 'buy')
  };

  const mockReviews = [
    { id: 1, author: "João Silva", content: "Excelente filme, atuações incríveis!", rating: 4.5 },
    { id: 2, author: "Maria Souza", content: "Uma obra prima do cinema moderno.", rating: 5 },
  ];

  return (
    <>
      {backdrops.length > 1 && (
        <button
          onClick={changeBackdrop}
          className="fixed top-20 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-colors z-50"
          aria-label="Trocar imagem de fundo"
        >
          <IoIosImages size={24} />
        </button>
      )}

      <div 
        className="w-full h-[55vh] bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(to top, rgb(17 24 39 / 1) 20%, transparent 100%),
            url(https://image.tmdb.org/t/p/original${currentBackdropPath})
          `,
        }}
      />
      
      <div className="container mx-auto px-4 md:px-12 py-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* COLUNA DA ESQUERDA */}
          <div className="w-full md:w-1/4 lg:w-1/5">
             <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              className="w-full rounded-lg shadow-lg mb-6"
            />
            {videos.length > 0 && (
              <a 
                href={`https://www.youtube.com/watch?v=${videos[0].key}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center mb-6 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Assistir Trailer
              </a>
            )}
            {/* ✅ RESTAURADO: Seção "Onde Assistir" completa */}
            {providers.length > 0 ? (
              <div className="bg-gray-800 p-4 rounded-lg">
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
                      <h3 className="text-md font-medium text-gray-300">Alugar</h3>
                      {groupedProviders.rent.map(provider => (
                        <ProviderItem key={provider.provider_id} provider={provider} id={id} />
                      ))}
                    </div>
                  )}
                  {groupedProviders.buy.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h3 className="text-md font-medium text-gray-300">Comprar</h3>
                      {groupedProviders.buy.map(provider => (
                        <ProviderItem key={provider.provider_id} provider={provider} id={id} />
                      ))}
                    </div>
                  )}
              </div>
            ) : (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Onde Assistir</h2>
                    <p className="text-sm text-gray-400">Nenhuma informação de streaming disponível.</p>
                </div>
            )}
          </div>

          {/* COLUNA DA DIREITA */}
          <div className="w-full md:w-3/4 lg:w-4/5 md:pt-24">
            <h1 className="text-4xl lg:text-5xl font-bold text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              {movie.title} <span className="text-3xl text-gray-400 font-light">({releaseYear})</span>
            </h1>
            <div className="flex items-center gap-4 my-4 text-gray-300">
              <span className="flex items-center gap-1 text-yellow-400">★ {movie.vote_average.toFixed(1)}</span>
              <span>•</span>
              <span>{movie.runtime} minutos</span>
            </div>
            
            <div className="my-6">
              <MovieActions onReviewClick={() => setIsReviewModalOpen(true)} />
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{movie.overview}</p>
            
            <div className="border-t border-gray-800 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Gêneros</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map(genre => (
                    <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {genre.name}
                    </span>
                  ))}
                </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
                {/* ✅ RESTAURADO: Botões e seções expansíveis de Elenco, Equipe e Datas */}
                <div className="flex gap-4 flex-wrap">
                    <button onClick={() => toggleSection('cast')} className={`px-4 py-2 rounded-lg transition-colors ${expandedSection === 'cast' ? 'bg-cyan-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>Elenco</button>
                    <button onClick={() => toggleSection('crew')} className={`px-4 py-2 rounded-lg transition-colors ${expandedSection === 'crew' ? 'bg-cyan-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>Equipe Técnica</button>
                    <button onClick={() => toggleSection('release')} className={`px-4 py-2 rounded-lg transition-colors ${expandedSection === 'release' ? 'bg-cyan-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}>Datas de Lançamento</button>
                </div>

                {expandedSection === 'cast' && ( <div className="mt-4 bg-gray-800 p-4 rounded-lg"><h3 className="font-semibold mb-3 text-lg">Elenco Principal</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{credits?.cast.slice(0, 12).map((person: any) => ( <div key={person.id} className="mb-2"><p className="font-medium text-white">{person.name}</p><p className="text-sm text-gray-400">{person.character || 'N/A'}</p></div> ))}</div></div> )}
                {expandedSection === 'crew' && ( <div className="mt-4 bg-gray-800 p-4 rounded-lg"><h3 className="font-semibold mb-3 text-lg">Direção e Roteiro</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{credits?.crew.filter((p: any) => ['Director', 'Writer', 'Screenplay'].includes(p.job)).map((person: any) => ( <div key={`${person.id}-${person.job}`} className="mb-2"><p className="font-medium text-white">{person.name}</p><p className="text-sm text-gray-400">{person.job}</p></div> ))}</div></div> )}
                {expandedSection === 'release' && ( <div className="mt-4 bg-gray-800 p-4 rounded-lg"><h3 className="font-semibold mb-3 text-lg">Datas por País</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{releaseDates?.filter((c: any) => c.release_dates?.length > 0).map((country: any) => ( <div key={country.iso_3166_1} className="mb-2"><p className="font-medium text-white">{country.iso_3166_1}</p><p className="text-sm text-gray-400">{new Date(country.release_dates[0].release_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p></div> ))}</div></div> )}
            </div>


            {/* Seção de Avaliações da Comunidade (Mock) */}
            <div className="mt-8 border-t border-gray-800 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Avaliações da Comunidade</h3>
                <div className="space-y-4">
                    {mockReviews.map(review => (
                        <div key={review.id} className="bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{review.author}</h3>
                            <span className="flex items-center text-yellow-400 text-sm">★ {review.rating}/5</span>
                            </div>
                            <p className="text-gray-300 text-sm">{review.content}</p>
                        </div>
                    ))}
                </div>
            </div>

          </div>
        </div>
      </div>
      
      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        movie={movie}
        posters={posters}
        currentPosterPath={currentPosterPath}
        onChangePoster={changePoster}
      />
    </>
  );
}