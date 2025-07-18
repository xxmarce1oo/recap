// arquivo: src/pages/FollowersPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import { getFollowers, getProfileByUsername } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

// Interface para um perfil de membro simplificado
interface MemberProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export default function FollowersPage() {
  // Pega o nome de usuário da URL (se existir)
  const { username: paramUsername } = useParams<{ username: string }>();
  // Pega o usuário logado atualmente
  const { user: currentUser } = useAuth();

  const [followers, setFollowers] = useState<MemberProfile[]>([]);
  const [profileOwner, setProfileOwner] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let targetProfileId: string | undefined;
      let displayUsername: string | undefined;

      if (paramUsername) {
        // Se há um nome de usuário na URL, busca o perfil desse usuário
        const fetchedProfile = await getProfileByUsername(paramUsername);
        targetProfileId = fetchedProfile.id;
        displayUsername = fetchedProfile.username;
        setProfileOwner(fetchedProfile as MemberProfile); // Define o proprietário do perfil para exibição
      } else if (currentUser) {
        // Se não há nome de usuário na URL, mas há um usuário logado, mostra os seguidores do usuário logado
        targetProfileId = currentUser.id;
        displayUsername = currentUser.user_metadata?.username || currentUser.email;
        setProfileOwner({ id: currentUser.id, username: displayUsername, avatar_url: currentUser.user_metadata?.avatar_url } as MemberProfile);
      } else {
        // Se não há nome de usuário na URL e o usuário não está logado
        setError('Você precisa estar logado para ver seus seguidores ou especificar um nome de usuário na URL.');
        setIsLoading(false);
        return;
      }

      if (targetProfileId) {
        const data = await getFollowers(targetProfileId);
        setFollowers(data);
      }
    } catch (err: any) {
      setError(err.message || 'Não foi possível carregar a lista de seguidores.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [paramUsername, currentUser]); // Recarrega se o nome de usuário da URL ou o usuário logado mudar

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]); // Dispara a busca quando o componente é montado ou fetchFollowers muda

  if (isLoading) {
    return <div className="text-center py-24">A carregar seguidores...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  // Define o título da página
  const pageTitle = profileOwner ? `Seguidores de ${profileOwner.username}` : 'Meus Seguidores';

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="mb-8">
        {/* Link para voltar ao perfil. Usa o nome de usuário do proprietário do perfil, se disponível. */}
        <Link to={`/profile/${profileOwner?.username || ''}`} className="flex items-center gap-3 text-cyan-400 hover:text-cyan-300 transition-colors w-max mb-4">
          <FaArrowLeft />
          <span>Voltar para o Perfil</span>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold">{pageTitle}</h1>
        {followers.length === 0 && (
          <p className="text-gray-400 mt-2">Ninguém está seguindo {profileOwner?.username || 'você'} ainda.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {followers.map(member => (
          <Link
            to={`/profile/${member.username}`}
            key={member.id}
            className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle size="100%" className="text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-bold text-white">{member.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}