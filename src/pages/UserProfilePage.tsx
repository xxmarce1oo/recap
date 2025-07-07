// arquivo: src/pages/UserProfilePage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaCamera, FaPencilAlt } from 'react-icons/fa';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import MovieSearchModal from '../components/MovieSearchModal';
import BackdropSelectionModal from '../components/BackdropSelectionModal';
import FavoriteMovieSlot from '../components/FavoriteMovieSlot';
import WatchlistPreview from '../components/WatchlistPreview';
import { updateAvatarUrl, updateProfileBanner, updateFavoriteMovieSlot } from '../services/profileService';
import { getMovieDetails, getMovieImages } from '../services/tmdbService';
import { getWatchlist } from '../services/watchlistService';
import { Movie } from '../models/movie';
import { supabase } from '../lib/supabaseClient';

export default function UserProfilePage() {
    const { user } = useAuth();
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerSearchModalOpen, setIsBannerSearchModalOpen] = useState(false);
    const [isBackdropSelectModalOpen, setIsBackdropSelectModalOpen] = useState(false);

    // Estados do Banner
    const [bannerBackdropPath, setBannerBackdropPath] = useState<string | null>(null);
    const [bannerPosition, setBannerPosition] = useState<string>('center');
    const [selectedMovieForBackdrop, setSelectedMovieForBackdrop] = useState<Movie | null>(null);
    const [availableBackdrops, setAvailableBackdrops] = useState<any[]>([]);

    // Estados para os filmes favoritos
    const [favoriteMovies, setFavoriteMovies] = useState<(Movie | null)[]>(Array(4).fill(null));
    const [isFavoriteSearchModalOpen, setIsFavoriteSearchModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<number | null>(null);

    // Estados para a pré-visualização da watchlist
    const [watchlistPreview, setWatchlistPreview] = useState<Movie[]>([]);
    const [watchlistCount, setWatchlistCount] = useState(0);

    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        if (!user) return;
        setIsProfileLoading(true);
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('banner_movie_id, banner_backdrop_path, banner_position, fav_movie_id_1, fav_movie_id_2, fav_movie_id_3, fav_movie_id_4')
                .eq('id', user.id)
                .single();

            const watchlistIds = await getWatchlist(user.id);
            setWatchlistCount(watchlistIds.length);

            if (profileData) {
                if (profileData.banner_backdrop_path) {
                    setBannerBackdropPath(profileData.banner_backdrop_path);
                    setBannerPosition(profileData.banner_position || 'center');
                }

                const favIds = [profileData.fav_movie_id_1, profileData.fav_movie_id_2, profileData.fav_movie_id_3, profileData.fav_movie_id_4];
                const previewWatchlistIds = watchlistIds.slice(0, 5);
                const allIds = [...favIds, ...previewWatchlistIds].filter(id => id !== null) as number[];
                const uniqueIds = [...new Set(allIds)];

                if (uniqueIds.length > 0) {
                    const movieDetails = await Promise.all(uniqueIds.map(id => getMovieDetails(id)));
                    const movieMap = new Map(movieDetails.map(movie => [movie.id, movie]));

                    const newFavorites = favIds.map(id => (id ? movieMap.get(id) : null) || null);
                    setFavoriteMovies(newFavorites);

                    const newWatchlistPreview = previewWatchlistIds.map(id => movieMap.get(id)!).filter(Boolean);
                    setWatchlistPreview(newWatchlistPreview);
                }
            }
        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        } finally {
            setIsProfileLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);
    
    const handleAvatarUpdate = async (url: string) => {
        if (!user) return;
        await updateAvatarUrl(user.id, url).catch(console.error);
    };

    const handleMovieSelectedForBanner = async (movie: Movie) => {
        setIsBannerSearchModalOpen(false);
        const images = await getMovieImages(movie.id);
        setSelectedMovieForBackdrop(movie);
        setAvailableBackdrops(images.backdrops || []);
        setIsBackdropSelectModalOpen(true);
    };

    const handleBackdropSelected = async (backdropPath: string, position: string) => {
        if (!user || !selectedMovieForBackdrop) return;
        await updateProfileBanner(user.id, selectedMovieForBackdrop.id, backdropPath, position);
        setBannerBackdropPath(backdropPath);
        setBannerPosition(position);
        setIsBackdropSelectModalOpen(false);
    };

    const handleOpenFavoriteModal = (slotIndex: number) => {
        setEditingSlot(slotIndex);
        setIsFavoriteSearchModalOpen(true);
    };

    const handleFavoriteMovieSelect = async (movie: Movie) => {
        if (editingSlot === null || !user) return;
        const originalFavorites = [...favoriteMovies];
        const newFavorites = [...favoriteMovies];
        newFavorites[editingSlot] = movie;
        setFavoriteMovies(newFavorites);
        try {
            await updateFavoriteMovieSlot(user.id, editingSlot, movie.id);
        } catch (error) {
            console.error("Erro ao salvar filme favorito:", error);
            setFavoriteMovies(originalFavorites);
        }
        setIsFavoriteSearchModalOpen(false);
        setEditingSlot(null);
    };

    if (!user && !isProfileLoading) {
        return (
            <div className="container mx-auto px-12 py-24 text-center">
                <p>Você precisa estar logado para ver seu perfil.</p>
            </div>
        );
    }

    const avatarUrl = user?.user_metadata?.avatar_url;
    const bannerUrl = bannerBackdropPath ? `https://image.tmdb.org/t/p/original${bannerBackdropPath}` : '';

    return (
        <>
            {/* ✅ O padding-top (pt-16) foi movido para este container principal */}
            <div className="pt-16">
                <div className="relative">
                    <div
                        className="w-full h-64 md:h-96 bg-cover group bg-center"
                        style={{ 
                            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(to bottom, #1f2937, #111827)',
                            backgroundPosition: `center ${bannerPosition}`,
                        }}
                    >
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div
                            className="absolute inset-0" 
                            style={{ background: 'linear-gradient(to bottom, transparent 70%, rgba(17, 24, 39, 0.8), #111827)' }}
                        ></div>
                        <button 
                            onClick={() => setIsBannerSearchModalOpen(true)}
                            className="absolute top-4 right-4 bg-black/50 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm z-30"
                        >
                            <FaCamera /> Alterar Banner
                        </button>
                    </div>

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
                                    {user?.user_metadata?.username || 'Usuário'}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Seção de Conteúdo Principal */}
                <div className="container mx-auto px-6 md:px-12 pt-28 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-8">
                            <div>
                                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Filmes Favoritos</h2>
                                {isProfileLoading ? (
                                    <div className="grid grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => <div key={i} className="aspect-[2/3] w-full bg-gray-800 rounded-lg animate-pulse" />)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-4">
                                        {favoriteMovies.map((movie, index) => (
                                            <FavoriteMovieSlot key={index} movie={movie} onSelectSlot={() => handleOpenFavoriteModal(index)} />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-gray-700/50 pt-8">
                                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Estatísticas</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="bg-gray-800/50 p-4 rounded-lg"><p className="text-3xl font-bold text-white">128</p><p className="text-sm text-gray-400">Filmes</p></div>
                                    <div className="bg-gray-800/50 p-4 rounded-lg"><p className="text-3xl font-bold text-white">42</p><p className="text-sm text-gray-400">Reviews</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-4">
                            {isProfileLoading ? (
                                <div className="bg-gray-800/50 p-4 rounded-lg animate-pulse h-32" />
                            ) : (
                                <WatchlistPreview movies={watchlistPreview} totalCount={watchlistCount} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modais */}
            <AvatarSelectionModal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)} onAvatarSelect={handleAvatarUpdate} />
            <MovieSearchModal isOpen={isBannerSearchModalOpen} onClose={() => setIsBannerSearchModalOpen(false)} onMovieSelect={handleMovieSelectedForBanner} />
            <BackdropSelectionModal 
                isOpen={isBackdropSelectModalOpen} 
                onClose={() => setIsBackdropSelectModalOpen(false)} 
                movie={selectedMovieForBackdrop}
                backdrops={availableBackdrops}
                onBackdropSelect={handleBackdropSelected}
            />
            <MovieSearchModal 
                isOpen={isFavoriteSearchModalOpen}
                onClose={() => setIsFavoriteSearchModalOpen(false)}
                onMovieSelect={handleFavoriteMovieSelect}
            />
        </>
    );
}