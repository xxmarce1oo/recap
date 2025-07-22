// arquivo: src/components/InvitationInboxModal.tsx

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { FaTimes, FaEnvelopeOpenText, FaCheck, FaTimesCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { EnrichedListInvitation } from '../services/listService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pendingInvitations: EnrichedListInvitation[];
  onInvitationsUpdate: () => void;
  onAccept: (invitationId: string) => void; // ✅ Propriedade adicionada
  onDecline: (invitationId: string) => void; // ✅ Propriedade adicionada
}

export default function InvitationInboxModal({ 
    isOpen, 
    onClose, 
    pendingInvitations, 
    onAccept,
    onDecline 
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // As funções de lógica foram removidas daqui para o componente apenas receber as ações.

  const handleAccept = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onAccept(id);
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDecline = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onDecline(id);
    } catch (e: any) {
      setError(e.message || "Ocorreu um erro");
    } finally {
      setIsProcessing(false);
    }
  }

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
                        onClick={() => handleAccept(invite.id)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <FaCheck /> Aceitar
                      </button>
                      <button
                        onClick={() => handleDecline(invite.id)}
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