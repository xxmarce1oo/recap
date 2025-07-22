// arquivo: src/components/PosterSelectionModal.tsx

import { Dialog } from '@headlessui/react';
import { FaTimes } from 'react-icons/fa';
import { Movie } from '../models/movie';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
  posters: any[];
  onPosterSelect: (path: string) => void;
}

export default function PosterSelectionModal({ isOpen, onClose, movie, posters, onPosterSelect }: Props) {
  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onPosterSelect(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl rounded-lg bg-gray-800 text-white shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <Dialog.Title className="text-xl font-bold">Escolha um Pôster para {movie?.title}</Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {posters.map((poster) => (
                <button
                  key={poster.file_path}
                  onClick={() => handleSelect(poster.file_path)}
                  className="aspect-[2/3] rounded-lg overflow-hidden border-2 border-transparent hover:border-cyan-400 focus:outline-none focus:border-cyan-400 transition-all group"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${poster.file_path}`}
                    alt="Opção de pôster"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}