// arquivo: src/components/AvatarSelectionModal.tsx

import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

// ✅ As URLs foram geradas seguindo o padrão que você forneceu.
const avatarOptions = [
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/000.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/001.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/002.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/003.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/004.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/005.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/006.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/007.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/008.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/009.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/010.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/011.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/012.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/013.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/014.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/015.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/016.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/017.png',
  'https://qzzrnbearoobyqkgaigh.supabase.co/storage/v1/object/public/avatars/018.png'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAvatarSelect: (url: string) => Promise<void>;
}

export default function AvatarSelectionModal({ isOpen, onClose, onAvatarSelect }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (url: string) => {
    setLoading(true);
    try {
      await onAvatarSelect(url);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar o avatar:", error);
      alert("Não foi possível atualizar o avatar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-gray-800 text-white shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Dialog.Title className="text-xl font-bold">Escolha seu Avatar</Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-10">Carregando...</div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {avatarOptions.map((url) => (
                  <button 
                    key={url} 
                    onClick={() => handleSelect(url)}
                    className="aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-cyan-400 focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <img src={url} alt="Opção de avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}