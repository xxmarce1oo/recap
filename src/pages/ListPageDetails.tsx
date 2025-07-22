// arquivo: src/pages/ListPageDetails.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Importa addMovieToList do service para adicionar filmes
import { getListById, removeMovieFromList, deleteList, addMovieToList } from '../services/listService';
import { EnrichedUserList } from '../models/list';
import MovieCard from '../components/MovieCard';
import { FaArrowLeft, FaTrashAlt, FaUsers, FaPlusCircle, FaTimes, FaUserCircle } from 'react-icons/fa';
import { getProfileByUsername, MemberProfile, getProfileById } from '../services/profileService';

import CollaboratorManagementModal from '../components/CollaboratorManagementModal'; // ✅ NOVO: Importar o modal de colaboradores
import MovieSearchModal from '../components/MovieSearchModal'; // ✅ NOVO: Importar o modal de busca de filmes
import { Movie } from '../models/movie'; // ✅ NOVO: Importar a interface Movie

export default function ListPageDetails() {
  const { listId } = useParams<{ listId: string }>();
  const { user, isLoading: authLoading } = useAuth();

  const [list, setList] = useState<EnrichedUserList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listOwnerProfile, setListOwnerProfile] = useState<MemberProfile | null>(null);
  const [collaboratorProfiles, setCollaboratorProfiles] = useState<MemberProfile[]>([]);

  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
  const [isMovieSearchModalOpen, setIsMovieSearchModalOpen] = useState(false); // ✅ NOVO: Estado para o modal de busca de filmes


  const fetchListDetails = useCallback(async () => {
    if (!listId) {
      setError('ID da lista não fornecido.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const fetchedList = await getListById(listId);
      if (!fetchedList) {
        setError('Lista não encontrada.');
        return;
      }
      setList(fetchedList);

      const ownerProfile = await getProfileById(fetchedList.user_id);
      setListOwnerProfile(ownerProfile as MemberProfile);

      const collabPromises = fetchedList.collaborator_ids
        .filter(id => id !== fetchedList.user_id)
        .map(id => getProfileById(id));
      const fetchedCollaborators = await Promise.all(collabPromises);
      setCollaboratorProfiles(fetchedCollaborators.filter(Boolean) as MemberProfile[]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível carregar os detalhes da lista.');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchListDetails();
  }, [fetchListDetails]);

  const handleRemoveMovie = async (movieId: number) => {
    if (!user || !list) return;
    if (!window.confirm('Tem certeza que deseja remover este filme da lista?')) return;

    try {
      await removeMovieFromList(list.id, movieId, user.id);
      fetchListDetails();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Não foi possível remover o filme da lista.');
    }
  };

  // ✅ NOVO: Função para adicionar um filme à lista
  const handleAddMovieToList = async (movie: Movie) => {
    if (!user || !list) return;
    setIsMovieSearchModalOpen(false);

    // ✅ CORREÇÃO AQUI: Usar list.movies em vez de list.movies_ids
    if (list.movies.some(m => m.id === movie.id)) {
        alert('Este filme já está na lista!');
        return;
    }


    try {
        await addMovieToList(list.id, movie.id, user.id);
        fetchListDetails(); // Recarrega a lista para mostrar o novo filme
    } catch (err: any) {
        console.error(err);
        alert(err.message || 'Não foi possível adicionar o filme à lista.');
    }
  };

  const handleDeleteList = async () => {
    if (!user || !list) return;
    if (!window.confirm('ATENÇÃO: Tem certeza que deseja DELETAR esta lista permanentemente?')) return;

    try {
      await deleteList(list.id, user.id);
      alert('Lista deletada com sucesso!');
      window.location.href = '/lists';
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Não foi possível deletar a lista.');
    }
  };

  if (isLoading || authLoading) {
    return <div className="text-center py-24">A carregar lista...</div>;
  }

  if (error) {
    return <div className="text-center py-24 text-red-500">{error}</div>;
  }

  if (!list) {
    return <div className="text-center py-24 text-gray-400">Lista não encontrada.</div>;
  }

  const isOwner = user?.id === list.user_id;
  const isCollaborator = list.collaborator_ids.includes(user?.id || '');
  const canEdit = isOwner || isCollaborator;

  return (
    <>
      <div className="container mx-auto px-6 md:px-12 py-24">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link to="/lists" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors w-max mb-4">
              <FaArrowLeft />
              <span>Voltar para Minhas Listas</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold">{list.name}</h1>
            {list.description && <p className="text-gray-400 mt-2">{list.description}</p>}
            <p className="text-gray-500 text-sm mt-1">
              Criado por: <span className="font-semibold text-white">{listOwnerProfile?.username || 'Carregando...'}</span>
            </p>
            {list.movies.length > 0 && (
              <p className="text-gray-500 text-sm mt-1">{list.movies.length} filmes</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
              {isOwner && (
                  <button
                      onClick={handleDeleteList}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                  >
                      <FaTrashAlt /> Deletar Lista
                  </button>
              )}
              {isOwner && (
                  <button
                      onClick={() => setIsCollaboratorModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                  >
                      <FaUsers /> Colaboradores
                  </button>
              )}
          </div>
        </div>

        {list.movies.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold">Esta lista está vazia</h2>
            {canEdit && (
              <button
                onClick={() => setIsMovieSearchModalOpen(true)} // ✅ NOVO: Botão para adicionar filme aqui também
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <FaPlusCircle /> Adicionar primeiro filme
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {list.movies.map((movie) => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} />
                {canEdit && (
                  <button
                    onClick={() => handleRemoveMovie(movie.id)}
                    className="absolute top-2 right-2 bg-red-600/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover da lista"
                  >
                    <FaTimes size={14} />
                  </button>
                )}
              </div>
            ))}
            {canEdit && (
              <button
                onClick={() => setIsMovieSearchModalOpen(true)} // ✅ NOVO: Abre o modal de busca de filmes
                className="aspect-[2/3] w-full h-auto bg-gray-800 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-700 hover:border-cyan-500 transition-colors cursor-pointer"
                title="Adicionar novo filme"
              >
                <FaPlusCircle className="text-gray-600 group-hover:text-cyan-500" size={32} />
              </button>
            )}
          </div>
        )}

        {list.collaborator_ids.length > 0 && (
          <div className="mt-12 border-t border-gray-800 pt-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUsers /> Colaboradores ({collaboratorProfiles.length + (listOwnerProfile ? 1 : 0)})
            </h2>
            <div className="flex flex-wrap gap-4">
              {listOwnerProfile && (
                <Link to={`/profile/${listOwnerProfile.username}`} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                    {listOwnerProfile.avatar_url ? (
                      <img src={listOwnerProfile.avatar_url} alt="Owner Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle size="100%" className="text-gray-500" />
                    )}
                  </div>
                  <span className="font-semibold text-white">{listOwnerProfile.username} (Proprietário)</span>
                </Link>
              )}
              {collaboratorProfiles.map(collab => (
                <Link to={`/profile/${collab.username}`} key={collab.id} className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-lg hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                    {collab.avatar_url ? (
                      <img src={collab.avatar_url} alt="Collab Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <FaUserCircle size="100%" className="text-gray-500" />
                    )}
                  </div>
                  <span className="font-semibold text-white">{collab.username}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ Modal de Gerenciamento de Colaboradores */}
      {list && isOwner && ( // Só o proprietário pode abrir o modal de gerenciar colaboradores
        <CollaboratorManagementModal
          isOpen={isCollaboratorModalOpen}
          onClose={() => setIsCollaboratorModalOpen(false)}
          listId={list.id}
          listOwnerId={list.user_id} // Passa o ID do proprietário
          currentCollaboratorIds={list.collaborator_ids}
          onUpdate={fetchListDetails} // Callback para atualizar a lista após mudanças
        />
      )}

      {/* ✅ Modal de Busca de Filmes para adicionar à lista */}
      <MovieSearchModal
        isOpen={isMovieSearchModalOpen}
        onClose={() => setIsMovieSearchModalOpen(false)}
        onMovieSelect={handleAddMovieToList} // Chama a função para adicionar filme
      />
    </>
  );
}