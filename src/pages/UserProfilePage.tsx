// ficheiro: src/pages/UserProfilePage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaCamera, FaPencilAlt, FaChartBar } from 'react-icons/fa';
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import MovieSearchModal from '../components/MovieSearchModal';
import BackdropSelectionModal from '../components/BackdropSelectionModal';
import FavoriteMovieSlot from '../components/FavoriteMovieSlot';
import WatchlistPreview from '../components/WatchlistPreview';
import DiaryGridItem from '../components/DiaryGridItem';
import StatsWidget from '../components/StatsWidget'; // ✅ IMPORTAMOS O NOVO WIDGET
import { updateAvatarUrl, updateProfileBanner, updateFavoriteMovieSlot } from '../services/profileService';
import { getMovieDetails, getMovieImages } from '../services/tmdbService';
import { getWatchlist } from '../services/watchlistService';
import { getUniqueFilmCount, getReviewCount, getRatingsDistribution, RatingsDistribution } from '../services/statsService'; // ✅ IMPORTAMOS A NOVA FUNÇÃO
import { getRecentEnrichedLogs, EnrichedLog } from '../services/logService';
import { Movie } from '../models/movie';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function UserProfilePage() {
    const { user } = useAuth();
    // ... (outros estados)
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerSearchModalOpen, setIsBannerSearchModalOpen] = useState(false);
    const [isBackdropSelectModalOpen, setIsBackdropSelectModalOpen] = useState(false);

    const [bannerBackdropPath, setBannerBackdropPath] = useState<string | null>(null);
    const [bannerPosition, setBannerPosition] = useState<string>('center');
    const [selectedMovieForBackdrop, setSelectedMovieForBackdrop] = useState<Movie | null>(null);
    const [availableBackdrops, setAvailableBackdrops] = useState<any[]>([]);

    const [favoriteMovies, setFavoriteMovies] = useState<(Movie | null)[]>(Array(4).fill(null));
    const [isFavoriteSearchModalOpen, setIsFavoriteSearchModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<number | null>(null);

    const [watchlistPreview, setWatchlistPreview] = useState<Movie[]>([]);
    const [watchlistCount, setWatchlistCount] = useState(0);

    const [filmCount, setFilmCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [recentLogs, setRecentLogs] = useState<EnrichedLog[]>([]);
    const [ratingsDistribution, setRatingsDistribution] = useState<RatingsDistribution>({}); // ✅ NOVO ESTADO PARA O GRÁFICO

    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const fetchProfileData = useCallback(async () => {
        if (!user) return;
        setIsProfileLoading(true);
        try {
            const [
                profileResponse,
                watchlistIds,
                fetchedFilmCount,
                fetchedReviewCount,
                fetchedRecentLogs,
                fetchedRatingsDistribution // ✅ BUSCAMOS OS DADOS DO GRÁFICO
            ] = await Promise.all([
                supabase.from('profiles').select('banner_movie_id, banner_backdrop_path, banner_position, fav_movie_id_1, fav_movie_id_2, fav_movie_id_3, fav_movie_id_4').eq('id', user.id).single(),
                getWatchlist(user.id),
                getUniqueFilmCount(user.id),
                getReviewCount(user.id),
                getRecentEnrichedLogs(user.id, 5),
                getRatingsDistribution(user.id) // ✅ CHAMAMOS A NOVA FUNÇÃO
            ]);

            setFilmCount(fetchedFilmCount);
            setReviewCount(fetchedReviewCount);
            setWatchlistCount(watchlistIds.length);
            setRecentLogs(fetchedRecentLogs);
            setRatingsDistribution(fetchedRatingsDistribution); // ✅ ATUALIZAMOS O ESTADO

            const profileData = profileResponse.data;
            if (profileData) {
                // ... (lógica do banner e favoritos)
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

    // ... (resto das funções handle... continua o mesmo)
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
        return <div className="container mx-auto px-12 py-24 text-center"><p>Precisa de estar autenticado para ver o seu perfil.</p></div>;
    }

    const avatarUrl = user?.user_metadata?.avatar_url;
    const bannerUrl = bannerBackdropPath ? `https://image.tmdb.org/t/p/original${bannerBackdropPath}` : '';

    return (
        <>
            <div className="pt">
                {/* ... (código do banner e avatar) ... */}
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

                <div className="container mx-auto px-6 md:px-12 pt-28 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        <div className="lg:col-span-3 space-y-8">
                            <div className="border-t border-gray-700/50 pt-8">
                                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">FILMES FAVORITOS</h2>
                                {/* ... (código dos favoritos) ... */}
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
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">ATIVIDADE RECENTE</h2>
                                    {recentLogs.length > 0 && (
                                        <Link to="/diary" className="text-xs text-cyan-400 hover:underline">Ver tudo</Link>
                                    )}
                                </div>
                                {isProfileLoading ? (
                                    <p>A carregar diário...</p>
                                ) : recentLogs.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                        {recentLogs.map(log => <DiaryGridItem key={log.id} log={log} />)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Ainda não registou nenhum filme no seu diário.</p>
                                )}
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                            <div>
                                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">ESTATÍSTICAS</h2>
                                <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold text-white">{isProfileLoading ? '...' : filmCount}</p>
                                            <p className="text-xs text-gray-400">Filmes</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{isProfileLoading ? '...' : reviewCount}</p>
                                            <p className="text-xs text-gray-400">Reviews</p>
                                        </div>
                                    </div>
                                    {/* ✅ INTEGRAÇÃO DO HISTOGRAMA */}
                                    {/* <div>
                                        <h3 className="text-xs text-gray-400 text-center mb-2">Distribuição de Notas</h3>
                                        {isProfileLoading ? <div className="h-24 bg-gray-700 animate-pulse rounded-md" /> : <RatingsHistogram distribution={ratingsDistribution} />}
                                    </div> */}
                                </div>
                            </div>
                            {isProfileLoading ? (
                                <div className="bg-gray-800/50 p-4 rounded-lg h-32 animate-pulse" />
                            ) : (
                                <StatsWidget
                                    reviewCount={reviewCount}
                                    distribution={ratingsDistribution}
                                />
                            )}

                            {/* Watchlist Preview */}
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
            {/* ... (código dos modais) ... */}
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