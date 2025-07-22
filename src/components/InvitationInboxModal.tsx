// arquivo: src/components/InvitationInboxModal.tsx

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { FaTimes, FaEnvelopeOpenText, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
// ✅ CORREÇÃO 1: Importar a nova interface e as funções corretas
import { EnrichedListInvitation, acceptInvitation, declineInvitation } from '../services/listService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pendingInvitations: EnrichedListInvitation[]; // ✅ Usar a nova interface
  onInvitationsUpdate: () => void;
}

export default function InvitationInboxModal({ isOpen, onClose, pendingInvitations, onInvitationsUpdate }: Props) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!user) {
      setError('Você precisa estar logado para aceitar convites.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      // ✅ CORREÇÃO 2: A função agora só precisa de um argumento
      await acceptInvitation(invitationId);
      alert('Convite aceito! A lista agora está na sua coleção.');
      onInvitationsUpdate();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível aceitar o convite.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    if (!user) {
      setError('Você precisa estar logado para recusar convites.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja recusar este convite?')) return;
    setIsProcessing(true);
    setError(null);
    try {
      await declineInvitation(invitationId, user.id);
      alert('Convite recusado.');
      onInvitationsUpdate();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível recusar o convite.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-gray-800 text-white shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Dialog.Title className="text-xl font-bold flex items-center gap-2">
              <FaEnvelopeOpenText size={20} className="text-purple-600"/> Solicitações de Convite
            </Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6">
            {pendingInvitations.length === 0 ? (
              <p className="text-center text-gray-400 text-lg py-10">Você não tem convites pendentes.</p>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {pendingInvitations.map(invite => (
                  <div key={invite.id} className="flex flex-col sm:flex-row justify-between items-center bg-gray-700 p-4 rounded-md">
                    <div className="text-white text-center sm:text-left mb-3 sm:mb-0">
                      <p className="font-semibold text-base">
                        {/* ✅ CORREÇÃO 3: Acesso seguro aos dados, sem (as any) */}
                        <Link to={`/profile/${invite.sender_profile?.username || ''}`} className="text-cyan-400 hover:underline">
                          {invite.sender_profile?.username || 'Usuário'}
                        </Link> convidou você para a lista
                        <span className="font-bold ml-1">
                           "{invite.lists?.name || 'Lista desconhecida'}"
                        </span>
                      </p>
                      {invite.lists?.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                          {invite.lists.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 mt-3 sm:mt-0">
                      <button
                        onClick={() => handleAcceptInvitation(invite.id)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <FaCheck /> Aceitar
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(invite.id)}
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <FaTimesCircle /> Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 flex justify-end items-center">
            {error && <p className="text-sm text-red-400 mr-4">{error}</p>}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}