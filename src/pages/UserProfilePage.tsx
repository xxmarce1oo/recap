// arquivo: src/pages/UserProfilePage.tsx

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUserCircle, FaCamera, FaPencilAlt } from 'react-icons/fa';

// Componentes
import AvatarSelectionModal from '../components/AvatarSelectionModal';
import MovieSearchModal from '../components/MovieSearchModal';
import BackdropSelectionModal from '../components/BackdropSelectionModal';
import FavoriteMovieSlot from '../components/FavoriteMovieSlot';
import WatchlistPreview from '../components/WatchlistPreview';
import DiaryGridItem from '../components/DiaryGridItem';
import StatsWidget from '../components/StatsWidget';

// Serviços
import {
    getProfileByUsername,
    updateAvatarUrl,
    updateProfileBanner,
    updateFavoriteMovieSlot,
    followUser,
    unfollowUser,
    checkFriendship,
    getFriendshipCounts
} from '../services/profileService';
import { getMovieDetails, getMovieImages } from '../services/tmdbService';
import { getWatchlist } from '../services/watchlistService';
import { getUniqueFilmCount, getReviewCount, getRatingsDistribution, RatingsDistribution } from '../services/statsService';
import { getRecentEnrichedLogs, EnrichedLog } from '../services/logService';
import { Movie } from '../models/movie';

// Tipos
interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    banner_movie_id: number | null;
    banner_backdrop_path: string | null;
    banner_position: string | null;
    fav_movie_id_1: number | null;
    fav_movie_id_2: number | null;
    fav_movie_id_3: number | null;
    fav_movie_id_4: number | null;
}

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { user: currentUser, isLoading: isAuthLoading } = useAuth();

    const [profileUser, setProfileUser] = useState<Profile | null>(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [friendshipCounts, setFriendshipCounts] = useState({ followers: 0, following: 0 });
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isBannerSearchModalOpen, setIsBannerSearchModalOpen] = useState(false);
    const [isBackdropSelectModalOpen, setIsBackdropSelectModalOpen] = useState(false);
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
    const [ratingsDistribution, setRatingsDistribution] = useState<RatingsDistribution>({});
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    // ✅ CORREÇÃO 1: O useCallback agora depende de valores primitivos e estáveis
    const fetchProfileData = useCallback(async (currentUserId: string | undefined, currentUsername: string | undefined) => {
        const targetUsername = username || currentUsername;

        if (!targetUsername) {
            if (!currentUserId && !isAuthLoading) navigate('/login');
            return;
        }
        if (!username && currentUsername) {
            navigate(`/profile/${currentUsername}`, { replace: true });
            return;
        }

        setIsProfileLoading(true);
        try {
            const fetchedProfile = await getProfileByUsername(targetUsername);
            setProfileUser(fetchedProfile as Profile);
            const viewingOwnProfile = currentUserId === fetchedProfile.id;
            setIsOwnProfile(viewingOwnProfile);

            if (!viewingOwnProfile && currentUserId) {
                const friendshipStatus = await checkFriendship(currentUserId, fetchedProfile.id);
                setIsFollowing(friendshipStatus);
            }

            const [
                watchlistIds, fetchedFilmCount, fetchedReviewCount,
                fetchedRecentLogs, fetchedRatingsDistribution, counts
            ] = await Promise.all([
                getWatchlist(fetchedProfile.id), getUniqueFilmCount(fetchedProfile.id),
                getReviewCount(fetchedProfile.id), getRecentEnrichedLogs(fetchedProfile.id, 6),
                getRatingsDistribution(fetchedProfile.id), getFriendshipCounts(fetchedProfile.id)
            ]);

            setFilmCount(fetchedFilmCount);
            setReviewCount(fetchedReviewCount);
            setWatchlistCount(watchlistIds.length);
            setRecentLogs(fetchedRecentLogs);
            setRatingsDistribution(fetchedRatingsDistribution);
            setFriendshipCounts(counts);

            const favIds = [fetchedProfile.fav_movie_id_1, fetchedProfile.fav_movie_id_2, fetchedProfile.fav_movie_id_3, fetchedProfile.fav_movie_id_4];
            const previewWatchlistIds = watchlistIds.slice(0, 5);
            const allIds = [...new Set([...favIds, ...previewWatchlistIds].filter(Boolean) as number[])];

            if (allIds.length > 0) {
                const movieDetails = await Promise.all(allIds.map(id => getMovieDetails(id).catch(() => null)));
                const movieMap = new Map(movieDetails.filter(Boolean).map(movie => [movie!.id, movie]));
                setFavoriteMovies(favIds.map(id => id ? movieMap.get(id) ?? null : null));
                setWatchlistPreview(previewWatchlistIds.map(id => movieMap.get(id)!).filter(Boolean));
            }

        } catch (error) {
            console.error(error);
            setProfileUser(null);
        } finally {
            setIsProfileLoading(false);
        }
    }, [username, navigate, isAuthLoading]); // Removido currentUser e outras dependências instáveis

    // ✅ CORREÇÃO 2: O useEffect agora chama a função com os dados estáveis
    useEffect(() => {
        if (!isAuthLoading) {
            fetchProfileData(currentUser?.id, currentUser?.user_metadata?.username);
        }
    }, [username, currentUser?.id, currentUser?.user_metadata?.username, isAuthLoading, fetchProfileData]);


    const handleFollowToggle = async () => {
        if (!currentUser || !profileUser || isOwnProfile) return;
        try {
            if (isFollowing) {
                await unfollowUser(currentUser.id, profileUser.id);
                setFriendshipCounts(prev => ({ ...prev, followers: prev.followers - 1 }));
            } else {
                await followUser(currentUser.id, profileUser.id);
                setFriendshipCounts(prev => ({ ...prev, followers: prev.followers + 1 }));
            }
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Erro ao seguir/deixar de seguir:", error);
        }
    };
    
    if (isProfileLoading || isAuthLoading) return <div className="text-center py-48">A carregar perfil...</div>;
    if (!profileUser) return <div className="text-center py-48">Utilizador não encontrado.</div>;

    return (
        <>
            <div className="pt">
                <div className="relative">
                    <div className="w-full h-64 md:h-96 bg-cover group bg-center" style={{ backgroundImage: profileUser.banner_backdrop_path ? `url(https://image.tmdb.org/t/p/original${profileUser.banner_backdrop_path})` : 'linear-gradient(to bottom, #1f2937, #111827)', backgroundPosition: `center ${profileUser.banner_position}` }}>
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 70%, rgba(17, 24, 39, 0.8), #111827)' }}></div>
                        {isOwnProfile && (
                            <button onClick={() => setIsBannerSearchModalOpen(true)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm z-30">
                                <FaCamera /> Alterar Banner
                            </button>
                        )}
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-20 w-full px-4 z-20 pointer-events-none">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 pointer-events-auto">
                                <div className="w-full h-full rounded-full border-4 border-gray-700 bg-gray-900 overflow-hidden shadow-lg">
                                    {profileUser.avatar_url ? (<img src={profileUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />) : (<FaUserCircle size="100%" className="text-gray-600" />)}
                                </div>
                                {isOwnProfile && (
                                    <button onClick={() => setIsAvatarModalOpen(true)} className="absolute bottom-1 right-1 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-full text-white shadow-md transition-transform hover:scale-110 z-10" aria-label="Alterar avatar">
                                        <FaPencilAlt size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 pointer-events-auto">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-3xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                        {profileUser.username}
                                    </h1>
                                </div>

                                <div className="flex justify-center gap-4 text-sm mt-2">
                                    <Link
                                        to={`/profile/${profileUser.username}/followers`}
                                        className="hover:text-white transition-colors"
                                    >
                                        <strong className="text-white">{friendshipCounts.followers}</strong> <span className="text-gray-400">seguidores</span>
                                    </Link>
                                    <Link
                                        to={`/profile/${profileUser.username}/following`}
                                        className="hover:text-white transition-colors"
                                    >
                                        <strong className="text-white">{friendshipCounts.following}</strong> <span className="text-gray-400">seguindo</span>
                                    </Link>
                                </div>
                            </div>
                            {!isOwnProfile && currentUser && (
                                <div className="mt-4 pointer-events-auto">
                                    <button onClick={handleFollowToggle} className={`px-4 py-1 text-sm font-bold rounded-md transition-colors ${isFollowing ? 'bg-gray-700 text-white hover:bg-red-600' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}>
                                        {isFollowing ? 'Seguindo' : 'Seguir'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 md:px-12 pt-40 pb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-8">
                            <div>
                                <div className="flex justify-between items-baseline">
                                    <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">ATIVIDADE RECENTE</h2>
                                    {recentLogs.length > 0 && (
                                        <Link to="/diary" className="text-xs text-cyan-400 hover:underline">Ver tudo</Link>
                                    )}
                                </div>
                                {recentLogs.length > 0 ? (
                                    <div className="grid grid-cols-6 gap-4">
                                        {recentLogs.map(log => <DiaryGridItem key={log.id} log={log} />)}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">Nenhuma atividade recente.</p>
                                )}
                            </div>
                            <div className="border-t border-gray-700/50 pt-8">
                                <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">FILMES FAVORITOS</h2>
                                <div className="grid grid-cols-4 gap-4">
                                    {favoriteMovies.map((movie, index) => (
                                        <FavoriteMovieSlot
                                            key={index}
                                            movie={movie}
                                            onSelectSlot={() => { if (isOwnProfile) { setEditingSlot(index); setIsFavoriteSearchModalOpen(true); } }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-1 space-y-8">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                    <p className="text-3xl font-bold text-white">{filmCount}</p>
                                    <p className="text-sm text-gray-400">Filmes</p>
                                </div>
                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                    <p className="text-3xl font-bold text-white">{reviewCount}</p>
                                    <p className="text-sm text-gray-400">Reviews</p>
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

                            <WatchlistPreview movies={watchlistPreview} totalCount={watchlistCount} />
                        </div>
                    </div>
                </div>
            </div>

            {isOwnProfile && (
                <>
                    <AvatarSelectionModal
                        isOpen={isAvatarModalOpen}
                        onClose={() => setIsAvatarModalOpen(false)}
                        onAvatarSelect={async (url) => {
                            if (!currentUser) return;
                            await updateAvatarUrl(currentUser.id, url);
                            fetchProfileData(currentUser.id, currentUser.user_metadata?.username);
                        }}
                    />
                    <MovieSearchModal
                        isOpen={isBannerSearchModalOpen}
                        onClose={() => setIsBannerSearchModalOpen(false)}
                        onMovieSelect={async (movie) => {
                            setSelectedMovieForBackdrop(movie);
                            setIsBannerSearchModalOpen(false);
                            const imagesData = await getMovieImages(movie.id);
                            setAvailableBackdrops(imagesData.backdrops || []);
                            setIsBackdropSelectModalOpen(true);
                        }}
                    />
                    <BackdropSelectionModal
                        isOpen={isBackdropSelectModalOpen}
                        onClose={() => setIsBackdropSelectModalOpen(false)}
                        movie={selectedMovieForBackdrop}
                        backdrops={availableBackdrops}
                        onBackdropSelect={async (path, pos) => {
                            if (!currentUser || !selectedMovieForBackdrop) return;
                            await updateProfileBanner(currentUser.id, selectedMovieForBackdrop.id, path, pos);
                            setIsBackdropSelectModalOpen(false);
                            fetchProfileData(currentUser.id, currentUser.user_metadata?.username);
                        }}
                    />
                    <MovieSearchModal
                        isOpen={isFavoriteSearchModalOpen}
                        onClose={() => setIsFavoriteSearchModalOpen(false)}
                        onMovieSelect={async (movie) => {
                            if (!currentUser || editingSlot === null) return;
                            await updateFavoriteMovieSlot(currentUser.id, editingSlot, movie.id);
                            setIsFavoriteSearchModalOpen(false);
                            fetchProfileData(currentUser.id, currentUser.user_metadata?.username);
                        }}
                    />
                </>
            )}
        </>
    );
}