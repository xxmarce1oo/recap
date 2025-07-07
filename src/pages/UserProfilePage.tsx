import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaCamera, FaPencilAlt } from 'react-icons/fa';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import MovieSearchModal from '../components/MovieSearchModal';
import BackdropSelectionModal from '../components/BackdropSelectionModal';
import { updateAvatarUrl, updateProfileBanner } from '../services/profileService';
import { getMovieDetails, getMovieImages } from '../services/tmdbService';
import { Movie } from '../models/movie';
import { supabase } from '../lib/supabaseClient';

export default function UserProfilePage() {
    const { user } = useAuth();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerSearchModalOpen, setIsBannerSearchModalOpen] = useState(false);
    const [isBackdropSelectModalOpen, setIsBackdropSelectModalOpen] = useState(false);

    const [bannerMovie, setBannerMovie] = useState<Movie | null>(null);
    const [bannerBackdropPath, setBannerBackdropPath] = useState<string | null>(null);
    const [bannerPosition, setBannerPosition] = useState<string>('center');
    const [selectedMovieForBackdrop, setSelectedMovieForBackdrop] = useState<Movie | null>(null);
    const [availableBackdrops, setAvailableBackdrops] = useState<any[]>([]);

    // Efeito para buscar os dados do banner e perfil do usuário quando a página carrega
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return;
            try {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('banner_movie_id, banner_backdrop_path, banner_position')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    throw profileError;
                }

                if (profileData?.banner_movie_id && profileData?.banner_backdrop_path) {
                    const movieDetails = await getMovieDetails(profileData.banner_movie_id);
                    setBannerMovie(movieDetails);
                    setBannerBackdropPath(profileData.banner_backdrop_path);
                    setBannerPosition(profileData.banner_position || 'center');
                }
            } catch (error) {
                console.error("Erro ao buscar dados do perfil:", error);
            }
        };

        fetchProfileData();
    }, [user]);

    // Função para atualizar o avatar
    const handleAvatarUpdate = async (url: string) => {
        if (!user) return;
        try {
            await updateAvatarUrl(user.id, url);
        } catch (error) {
            console.error("Falha ao atualizar avatar:", error);
            throw error;
        }
    };

    // Função chamada quando um filme é escolhido no modal de busca
    const handleMovieSelectedForBanner = async (movie: Movie) => {
        setIsBannerSearchModalOpen(false);
        try {
            const images = await getMovieImages(movie.id);
            setSelectedMovieForBackdrop(movie);
            setAvailableBackdrops(images.backdrops || []);
            setIsBackdropSelectModalOpen(true);
        } catch (error) {
            console.error("Erro ao buscar backdrops:", error);
        }
    };

    // Função chamada quando um backdrop é finalmente escolhido
    const handleBackdropSelected = async (backdropPath: string, position: string) => {
        if (!user || !selectedMovieForBackdrop) return;
        try {
            await updateProfileBanner(user.id, selectedMovieForBackdrop.id, backdropPath, position);
            setBannerMovie(selectedMovieForBackdrop);
            setBannerBackdropPath(backdropPath);
            setBannerPosition(position);
            setIsBackdropSelectModalOpen(false);
        } catch (error) {
            console.error("Erro ao atualizar o banner:", error);
            alert("Não foi possível atualizar o banner.");
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto px-12 py-24 text-center">
                <p>Você precisa estar logado para ver seu perfil.</p>
            </div>
        );
    }

    const avatarUrl = user.user_metadata?.avatar_url;
    const bannerUrl = bannerBackdropPath ? `https://image.tmdb.org/t/p/original${bannerBackdropPath}` : '';

    return (
        <>
            <div className="bg-gray-900 text-white min-h-screen pt-16">
                <div className="relative">
                    {/* Banner com posição ajustável */}
                    <div
                        className="w-full h-96 bg-cover group"
                        style={{ 
                            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(to bottom, #1f2937, #111827)',
                            backgroundPosition: `center ${bannerPosition}`,
                        }}
                    >
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div
                            className="absolute inset-0" 
                            style={{ background: 'linear-gradient(to bottom, transparent 90%, rgba(17, 24, 39, 0.8), #111827)' }}
                        ></div>
                        <button 
                            onClick={() => setIsBannerSearchModalOpen(true)}
                            className="absolute top-4 right-4 bg-black/50 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm z-30"
                        >
                            <FaCamera /> Alterar Banner
                        </button>
                    </div>

                    {/* Avatar e informações do usuário */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-20 w-full px-4 z-20 pointer-events-none">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 pointer-events-auto">
                                <div className="w-full h-full rounded-full border-4 border-gray-700 bg-gray-900 overflow-hidden shadow-lg">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaUserCircle size="100%" className="text-gray-600" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => setIsAvatarModalOpen(true)}
                                    className="absolute bottom-1 right-1 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-full text-white shadow-md transition-transform hover:scale-110 z-10"
                                    aria-label="Alterar avatar"
                                >
                                    <FaPencilAlt size={14} />
                                </button>
                            </div>
                            
                            <div className="mt-4 pointer-events-auto">
                                <h1 className="text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                    {user.user_metadata?.username || 'Usuário'}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 md:px-12 pt-28 pb-16">
                    <div className="mt-8 border-t border-gray-700/50 pt-8">
                        <h2 className="text-2xl font-bold mb-4">Estatísticas</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-3xl font-bold text-cyan-400">128</p>
                                <p className="text-sm text-gray-400">Filmes Assistidos</p>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <p className="text-3xl font-bold text-cyan-400">42</p>
                                <p className="text-sm text-gray-400">Reviews Escritas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} onAvatarSelect={handleAvatarUpdate} />
            <MovieSearchModal isOpen={isBannerSearchModalOpen} onClose={() => setIsBannerSearchModalOpen(false)} onMovieSelect={handleMovieSelectedForBanner} />
            <BackdropSelectionModal 
                isOpen={isBackdropSelectModalOpen} 
                onClose={() => setIsBackdropSelectModalOpen(false)} 
                movie={selectedMovieForBackdrop}
                backdrops={availableBackdrops}
                onBackdropSelect={handleBackdropSelected}
            />
        </>
    );
}