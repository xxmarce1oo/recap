// arquivo: src/components/CollaboratorManagementModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaUserPlus, FaUserMinus, FaSearch, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getAllProfiles, MemberProfile } from '../services/profileService';
// ✅ CORREÇÃO AQUI: Importar sendInvitation, não addCollaboratorToList
import { sendInvitation, removeCollaboratorFromList } from '../services/listService';
import { getProfileById } from '../services/profileService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  listOwnerId: string;
  currentCollaboratorIds: string[];
  onUpdate: () => void;
}

export default function CollaboratorManagementModal({
  isOpen,
  onClose,
  listId,
  listOwnerId,
  currentCollaboratorIds,
  onUpdate,
}: Props) {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [allProfiles, setAllProfiles] = useState<MemberProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<MemberProfile[]>([]
);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingCollaborators, setIsUpdatingCollaborators] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profiles = await getAllProfiles();
        setAllProfiles(profiles || []);
      } catch (err: any) {
        setError('Não foi possível carregar os perfis de usuários.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allProfiles.filter(profile =>
      profile.username.toLowerCase().includes(lowerCaseSearchTerm) &&
      !currentCollaboratorIds.includes(profile.id) &&
      profile.id !== listOwnerId && // Proprietário não é adicionável
      profile.id !== currentUser?.id // O próprio usuário logado não é adicionável a si mesmo
    );
    setFilteredProfiles(filtered);
  }, [searchTerm, allProfiles, currentCollaboratorIds, listOwnerId, currentUser]);

  // ✅ CORREÇÃO AQUI: Chamar sendInvitation em vez de addCollaboratorToList
  const handleAddCollaborator = async (collaboratorToAddId: string) => {
    if (!currentUser) {
      setError('Você precisa estar logado para enviar convites.');
      return;
    }
    setIsUpdatingCollaborators(true);
    setError(null);
    try {
      await sendInvitation(listId, currentUser.id, collaboratorToAddId); // ✅ Usando sendInvitation
      onUpdate();
      setSearchTerm('');
      alert('Convite enviado com sucesso!'); // ✅ Mudar mensagem
    } catch (err: any) {
      setError(err.message || 'Não foi possível enviar o convite.'); // ✅ Mudar mensagem de erro
      console.error(err);
    } finally {
      setIsUpdatingCollaborators(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorToRemoveId: string) => {
    if (!currentUser) {
      setError('Você precisa estar logado para remover colaboradores.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja remover este colaborador?')) return;

    setIsUpdatingCollaborators(true);
    setError(null);
    try {
      await removeCollaboratorFromList(listId, currentUser.id, collaboratorToRemoveId);
      onUpdate();
      alert('Colaborador removido com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Não foi possível remover o colaborador.');
      console.error(err);
    } finally {
      setIsUpdatingCollaborators(false);
    }
  };

  const collaboratorsExcludingOwner = allProfiles.filter(profile =>
    currentCollaboratorIds.includes(profile.id) && profile.id !== listOwnerId
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-xl rounded-lg bg-gray-800 text-white shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Dialog.Title className="text-xl font-bold">Gerenciar Colaboradores</Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Colaboradores Atuais</h3>
              {collaboratorsExcludingOwner.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum colaborador adicionado ainda (além do proprietário).</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {collaboratorsExcludingOwner.map(collab => (
                    <div key={collab.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                          {collab.avatar_url ? (
                            <img src={collab.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <FaUserCircle size="100%" className="text-gray-500" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{collab.username}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.id)}
                        disabled={isUpdatingCollaborators}
                        className="text-red-400 hover:text-red-500 disabled:opacity-50"
                        title="Remover colaborador"
                      >
                        <FaUserMinus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Convidar Novo Colaborador</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar usuário pelo nome..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading || isUpdatingCollaborators}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaSearch />
                </span>
              </div>

              {isLoading ? (
                <p className="text-center text-gray-400 mt-4">Carregando usuários...</p>
              ) : (
                searchTerm.trim() !== '' && filteredProfiles.length === 0 ? (
                  <p className="text-center text-gray-400 mt-4">Nenhum usuário encontrado que possa ser convidado.</p>
                ) : (
                  <div className="mt-4 max-h-48 overflow-y-auto pr-2">
                    <div className="space-y-2">
                      {filteredProfiles.map(profile => (
                        <div key={profile.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                              {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <FaUserCircle size="100%" className="text-gray-500" />
                              )}
                            </div>
                            <span className="font-medium text-sm">{profile.username}</span>
                          </div>
                          <button
                            onClick={() => handleAddCollaborator(profile.id)} // Chama para enviar convite
                            disabled={isUpdatingCollaborators}
                            className="text-cyan-400 hover:text-cyan-500 disabled:opacity-50"
                            title="Enviar convite para colaborar"
                          >
                            <FaUserPlus size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-700 flex justify-end items-center">
            {error && <p className="text-sm text-red-400 mr-4">{error}</p>}
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdatingCollaborators}
              className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Fechar
            </button>
          </div>
        </Dialog.Panel>
      </div>

    </Dialog>
  );
}