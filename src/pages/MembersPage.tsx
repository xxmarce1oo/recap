// ficheiro: src/pages/MembersPage.tsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { getAllProfiles } from '../services/profileService';

interface MemberProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export default function MembersPage() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const data = await getAllProfiles();
        setMembers(data || []);
      } catch (err) {
        setError('Não foi possível carregar a lista de membros.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (isLoading) {
    return <div className="text-center py-24">A carregar membros...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <h1 className="text-4xl md:text-5xl font-bold mb-8">Membros</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map(member => (
          <Link 
            to={`/profile/${member.username}`} 
            key={member.id}
            className="bg-gray-800/50 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-700 transition-colors"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle size="100%" className="text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-bold text-white">{member.username}</p>
              {/* No futuro, podemos adicionar aqui a contagem de filmes ou seguidores */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}