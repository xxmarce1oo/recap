// arquivo: src/services/listService.ts

import { supabase } from '../lib/supabaseClient';
import { UserList, EnrichedUserList } from '../models/list';
import { getMovieDetails } from './tmdbService';
import { Movie } from '../models/movie'; // ✅ NOVO: Importar a interface Movie

/**
 * Funções auxiliares de autorização
 */
const getListAndCheckAuthorization = async (listId: string, userId: string, checkOwnerOnly: boolean = false) => {
  const { data: list, error } = await supabase
    .from('lists')
    .select('id, user_id, collaborator_ids')
    .eq('id', listId)
    .single();

  if (error) {
    console.error('Erro ao buscar lista para verificação de autorização:', error);
    throw new Error('Erro ao buscar lista.');
  }
  if (!list) {
    throw new Error('Lista não encontrada.');
  }

  const isOwner = list.user_id === userId;
  const isCollaborator = !checkOwnerOnly && list.collaborator_ids?.includes(userId);

  if (!isOwner && !isCollaborator) {
    throw new Error('Você não tem permissão para realizar esta ação nesta lista.');
  }

  return list;
};

/**
 * Cria uma nova lista para o usuário.
 * O criador da lista é automaticamente adicionado como colaborador.
 * @param listData Os dados da nova lista (nome, descrição, etc.).
 * @returns A lista criada.
 */
export const createList = async (listData: Omit<UserList, 'id' | 'created_at' | 'collaborator_ids'>): Promise<UserList> => {
  const initialCollaborators = [listData.user_id];

  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: listData.user_id,
      name: listData.name,
      description: listData.description,
      movies_ids: listData.movies_ids,
      collaborator_ids: initialCollaborators,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar lista:', error);
    throw new Error('Não foi possível criar a lista. Tente novamente.');
  }
  return data;
};

/**
 * Busca todas as listas de um usuário.
 * Agora busca tanto as listas que o usuário é proprietário quanto as que é colaborador.
 * @param userId O ID do usuário.
 * @returns Um array de listas do usuário.
 */
export const getListsByUserId = async (userId: string): Promise<UserList[]> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .or(`user_id.eq.${userId},collaborator_ids.cs.{"${userId}"}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar listas do usuário:', error);
    throw error;
  }
  return data || [];
};

/**
 * Busca uma única lista pelo seu ID e enriquece com detalhes dos filmes.
 * @param listId O ID da lista.
 * @returns A lista enriquecida.
 */
export const getListById = async (listId: string): Promise<EnrichedUserList | null> => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Erro ao buscar lista por ID:', error);
    throw error;
  }

  if (!data) return null;

  const movieDetailsPromises = data.movies_ids.map((id: number) => getMovieDetails(id));
  const movies = await Promise.all(movieDetailsPromises);

  const validMovies = movies.filter(movie => movie !== null);

  const enrichedList: EnrichedUserList = {
    ...data,
    movies: validMovies as Movie[],
  };

  return enrichedList;
};

/**
 * Adiciona um filme a uma lista existente.
 * Requer que o usuário seja proprietário ou colaborador.
 * @param listId O ID da lista.
 * @param movieId O ID do filme a ser adicionado.
 * @param userId O ID do usuário tentando adicionar o filme (para verificação de permissão).
 */
export const addMovieToList = async (listId: string, movieId: number, userId: string): Promise<void> => {
  const existingList = await getListAndCheckAuthorization(listId, userId);

  const { data: fullList, error: fetchError } = await supabase
    .from('lists')
    .select('movies_ids')
    .eq('id', listId)
    .single();

  if (fetchError || !fullList) {
    console.error('Erro ao buscar lista para adicionar filme após autorização:', fetchError);
    throw new Error('Lista não encontrada ou erro ao buscar detalhes.');
  }

  const currentMovieIds = fullList.movies_ids || [];

  if (currentMovieIds.includes(movieId)) {
    console.warn(`Filme ${movieId} já está na lista ${listId}.`);
    return;
  }

  const newMoviesIds = [...currentMovieIds, movieId];

  const { error: updateError } = await supabase
    .from('lists')
    .update({ movies_ids: newMoviesIds })
    .eq('id', listId);

  if (updateError) {
    console.error('Erro ao adicionar filme à lista:', updateError);
    throw new Error('Não foi possível adicionar o filme à lista.');
  }
};

/**
 * Remove um filme de uma lista existente.
 * Requer que o usuário seja proprietário ou colaborador.
 * @param listId O ID da lista.
 * @param movieId O ID do filme a ser removido.
 * @param userId O ID do usuário tentando remover o filme (para verificação de permissão).
 */
export const removeMovieFromList = async (listId: string, movieId: number, userId: string): Promise<void> => {
  const existingList = await getListAndCheckAuthorization(listId, userId);

  const { data: fullList, error: fetchError } = await supabase
    .from('lists')
    .select('movies_ids')
    .eq('id', listId)
    .single();

  if (fetchError || !fullList) {
    console.error('Erro ao buscar lista para remover filme após autorização:', fetchError);
    throw new Error('Lista não encontrada ou erro ao buscar detalhes.');
  }

  const currentMovieIds = fullList.movies_ids || [];

  const newMoviesIds = currentMovieIds.filter((id: number) => id !== movieId);

  const { error: updateError } = await supabase
    .from('lists')
    .update({ movies_ids: newMoviesIds })
    .eq('id', listId);

  if (updateError) {
    console.error('Erro ao remover filme da lista:', updateError);
    throw new Error('Não foi possível remover o filme da lista.');
  }
};

/**
 * Deleta uma lista.
 * Requer que o usuário seja o PROPRIETÁRIO da lista.
 * @param listId O ID da lista a ser deletada.
 * @param userId O ID do usuário tentando deletar a lista (para verificação de permissão).
 */
export const deleteList = async (listId: string, userId: string): Promise<void> => {
  await getListAndCheckAuthorization(listId, userId, true);

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId);

  if (error) {
    console.error('Erro ao deletar lista:', error);
    throw new Error('Não foi possível deletar a lista.');
  }
};

/**
 * Adiciona um colaborador a uma lista.
 * Requer que o usuário seja o PROPRIETÁRIO da lista.
 * @param listId O ID da lista.
 * @param ownerId O ID do proprietário da lista (para verificação de permissão).
 * @param newCollaboratorId O ID do novo colaborador a ser adicionado.
 */
export const addCollaboratorToList = async (listId: string, ownerId: string, newCollaboratorId: string): Promise<void> => {
  const list = await getListAndCheckAuthorization(listId, ownerId, true);

  if (list.user_id === newCollaboratorId) {
    throw new Error('O proprietário da lista já tem acesso total.');
  }
  if (list.collaborator_ids?.includes(newCollaboratorId)) {
    throw new Error('Este usuário já é um colaborador da lista.');
  }

  const updatedCollaborators = [...(list.collaborator_ids || []), newCollaboratorId];

  const { error } = await supabase
    .from('lists')
    .update({ collaborator_ids: updatedCollaborators })
    .eq('id', listId);

  if (error) {
    console.error('Erro ao adicionar colaborador:', error);
    throw new Error('Não foi possível adicionar o colaborador.');
  }
};

/**
 * Remove um colaborador de uma lista.
 * Requer que o usuário seja o PROPRIETÁRIO da lista.
 * @param listId O ID da lista.
 * @param ownerId O ID do proprietário da lista (para verificação de permissão).
 * @param collaboratorToRemoveId O ID do colaborador a ser removido.
 */
export const removeCollaboratorFromList = async (listId: string, ownerId: string, collaboratorToRemoveId: string): Promise<void> => {
  const list = await getListAndCheckAuthorization(listId, ownerId, true);

  if (list.user_id === collaboratorToRemoveId) {
    throw new Error('O proprietário da lista não pode ser removido como colaborador.');
  }

  const updatedCollaborators = (list.collaborator_ids || []).filter((id: string) => id !== collaboratorToRemoveId); // ✅ CORREÇÃO: Tipar 'id' aqui

  const { error } = await supabase
    .from('lists')
    .update({ collaborator_ids: updatedCollaborators })
    .eq('id', listId);

  if (error) {
    console.error('Erro ao remover colaborador:', error);
    throw new Error('Não foi possível remover o colaborador.');
  }
};