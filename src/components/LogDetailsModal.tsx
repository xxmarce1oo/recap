// ficheiro: src/components/LogDetailsModal.tsx

import { Dialog } from '@headlessui/react';
import { FaHeart, FaStar, FaTimes } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EnrichedLog } from '../services/logService';
import { Link } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  log: EnrichedLog | null;
}

export default function LogDetailsModal({ isOpen, onClose, log }: Props) {
  if (!log) {
    return null;
  }

  const { movie, watched_date, rating, review_text, is_liked } = log;
  const formattedDate = format(parseISO(watched_date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-gray-800 text-white shadow-2xl">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <Dialog.Title className="font-bold">Seu Log</Dialog.Title>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <Link to={`/movie/${movie.id}`}>
                <h2 className="text-2xl font-bold hover:text-cyan-400">{movie.title}</h2>
              </Link>
              <p className="text-sm text-gray-400">Assistido em {formattedDate}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-600'} />
                ))}
              </span>
              {is_liked && <FaHeart className="text-red-500" />}
            </div>

            {review_text ? (
              <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-300">
                {review_text}
              </blockquote>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma anotação para este log.</p>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}