// arquivo: src/pages/UserListsPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// ✅ CORREÇÃO 1: Importamos 'EnrichedListInvitation' em vez de 'ListInvitation'
import { UserList } from '../models/list';
import { getListsByUserId, deleteList, getPendingInvitationsForUser, acceptInvitation, declineInvitation, EnrichedListInvitation } from '../services/listService';
import { FaPlus, FaEnvelopeOpenText } from 'react-icons/fa';

import ListFormModal from '../components/ListFormModal';
import InvitationInboxModal from '../components/InvitationInboxModal';

export default function UserListsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [userLists, setUserLists] = useState<UserList[]>([]);
  // ✅ CORREÇÃO 1 (continuação): Usamos o tipo correto no estado
  const [pendingInvitations, setPendingInvitations] = useState<EnrichedListInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const lists = await getListsByUserId(user.id);
      setUserLists(lists);

      const invitations = await getPendingInvitationsForUser(user.id);
      setPendingInvitations(invitations);

    } catch (err: any) {
      console.error(err);
      setError('Não foi possível carregar suas listas ou convites.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
        fetchData();
    }
  }, [fetchData, authLoading]);

  const handleDeleteList = async (listId: string) => {
    if (!user) {
      alert('Você precisa estar logado para deletar uma lista.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja deletar esta lista?')) {
      return;
    }
    try {
      await deleteList(listId, user.id);
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Não foi possível deletar a lista.');
    }
  };
  
  // ✅ CORREÇÃO 2: A chamada para acceptInvitation agora passa apenas 1 argumento
  const handleAcceptInvitation = async (invitationId: string) => {
    if (!user) return;
    try {
      await acceptInvitation(invitationId);
      alert('Convite aceito! A lista agora está na sua coleção.');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Não foi possível aceitar o convite.');
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja recusar este convite?')) return;
    try {
      await declineInvitation(invitationId, user.id);
      alert('Convite recusado.');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Não foi possível recusar o convite.');
    }
  };


  if (authLoading) {
    return <div className="text-center py-24">A carregar...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-6 md:px-12 text-center py-24">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-gray-400 mt-2">Você precisa estar logado para ver e gerenciar suas listas.</p>
        <Link to="/" className="text-cyan-400 mt-4 inline-block hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 md:px-12 py-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">Minhas Listas</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setIsInvitationModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors relative"
          >
            <FaEnvelopeOpenText /> Convites
            {pendingInvitations.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingInvitations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Nova Lista
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-lg">A carregar listas...</p>
      ) : error ? (
        <p className="text-center text-lg text-red-500">{error}</p>
      ) : userLists.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold">Você não tem listas ainda</h2>
          <p className="text-gray-400 mt-2">Clique em "Nova Lista" para começar a organizar seus filmes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLists.map((list) => (
            <div key={list.id} className="bg-gray-800 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{list.name}</h2>
                {list.description && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{list.description}</p>}
                <p className="text-gray-500 text-xs mt-2">{list.movies_ids.length} filme(s)</p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Link
                  to={`/lists/${list.id}`}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-semibold"
                >
                  Ver Lista
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ListFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateSuccess={fetchData} />

      <InvitationInboxModal
        isOpen={isInvitationModalOpen}
        onClose={() => setIsInvitationModalOpen(false)}
        pendingInvitations={pendingInvitations}
        onInvitationsUpdate={fetchData}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
      />
    </div>
  );
}