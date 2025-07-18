// arquivo: src/components/ListFormModal.tsx

import { Dialog } from '@headlessui/react';
import { useState, FormEvent, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; // Para pegar o user.id
import { createList } from '../services/listService'; // Para salvar a lista
import { Movie } from '../models/movie'; // Para tipagem dos filmes
import MovieSearchModal from './MovieSearchModal'; // Para buscar filmes para adicionar à lista

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void; // Callback para atualizar as listas na página principal
  // Em uma expansão futura, passaria um 'listToEdit: UserList | null'
}

export default function ListFormModal({ isOpen, onClose, onCreateSuccess }: Props) {
  const { user } = useAuth();
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]); // Filmes adicionados à lista
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMovieSearchModalOpen, setIsMovieSearchModalOpen] = useState(false); // Para controlar o modal de busca de filmes

  // Limpa o formulário quando o modal é aberto ou fechado
  useEffect(() => {
    if (!isOpen) {
      // Pequeno atraso para a animação do modal antes de resetar o conteúdo
      setTimeout(() => {
        setListName('');
        setListDescription('');
        setSelectedMovies([]);
        setError(null);
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleMovieSelect = (movie: Movie) => {
    // Adiciona o filme se ele ainda não estiver na lista
    if (!selectedMovies.some(m => m.id === movie.id)) {
      setSelectedMovies(prev => [...prev, movie]);
    }
    setIsMovieSearchModalOpen(false); // Fecha o modal de busca
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies(prev => prev.filter(movie => movie.id !== movieId));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logado para criar uma lista.');
      return;
    }

    if (!listName.trim()) {
      setError('O nome da lista não pode estar vazio.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createList({
        user_id: user.id,
        name: listName.trim(),
        description: listDescription.trim() || null,
        movies_ids: selectedMovies.map(movie => movie.id),
      });
      onCreateSuccess(); // Informa à página principal que uma nova lista foi criada
      onClose(); // Fecha o modal
    } catch (err: any) {
      console.error('Erro ao criar lista:', err);
      setError(err.message || 'Ocorreu um erro ao criar a lista. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-gray-800 text-white shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <Dialog.Title className="text-xl font-bold">Criar Nova Lista</Dialog.Title>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Nome da Lista */}
                <div>
                  <label htmlFor="listName" className="block text-sm font-medium text-gray-300 mb-1">Nome da Lista <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="listName"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Minha lista de filmes favoritos"
                    required
                  />
                </div>

                {/* Descrição da Lista */}
                <div>
                  <label htmlFor="listDescription" className="block text-sm font-medium text-gray-300 mb-1">Descrição (opcional)</label>
                  <textarea
                    id="listDescription"
                    value={listDescription}
                    onChange={(e) => setListDescription(e.target.value)}
                    rows={3}
                    className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Uma descrição para a sua lista..."
                  />
                </div>

                {/* Adicionar Filmes à Lista */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Filmes na Lista</h3>
                  <button
                    type="button"
                    onClick={() => setIsMovieSearchModalOpen(true)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-md flex items-center justify-center gap-2 transition-colors border border-dashed border-gray-600"
                  >
                    <FaPlus size={14} /> Adicionar Filmes
                  </button>

                  {/* Lista de Filmes Selecionados */}
                  {selectedMovies.length > 0 && (
                    <div className="mt-4 max-h-48 overflow-y-auto pr-2">
                      <div className="space-y-2">
                        {selectedMovies.map(movie => (
                          <div key={movie.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <div className="flex items-center gap-3">
                              <img
                                src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://via.placeholder.com/50x75?text=Recap'}
                                alt={movie.title}
                                className="w-10 h-14 rounded object-cover"
                              />
                              <span className="font-medium text-sm">{movie.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMovie(movie.id)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <FaTimes size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer do Modal com Botões de Ação */}
              <div className="p-4 border-t border-gray-700 flex justify-end items-center">
                {error && <p className="text-sm text-red-400 mr-4">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Criar Lista'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* MovieSearchModal para adicionar filmes */}
      <MovieSearchModal
        isOpen={isMovieSearchModalOpen}
        onClose={() => setIsMovieSearchModalOpen(false)}
        onMovieSelect={handleMovieSelect}
      />
    </>
  );
}