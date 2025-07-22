// arquivo: src/services/listService.ts

import { supabase } from '../lib/supabaseClient';
import { UserList, EnrichedUserList } from '../models/list';
import { getMovieDetails } from './tmdbService';
import { Movie } from '../models/movie';

// INTERFACE CORRIGIDA E ENRIQUECIDA PARA CONVITES
export interface EnrichedListInvitation {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  lists: { // O Supabase vai aninhar os dados da lista aqui
    name: string;
    description: string | null;
  } | null; // Pode ser um objeto ou nulo
  sender_profile: { // E os dados do perfil do remetente aqui
    username: string;
  } | null; // Pode ser um objeto ou nulo
}

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
  await getListAndCheckAuthorization(listId, userId);

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
  await getListAndCheckAuthorization(listId, userId);

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

  const updatedCollaborators = (list.collaborator_ids || []).filter((id: string) => id !== collaboratorToRemoveId);

  const { error } = await supabase
    .from('lists')
    .update({ collaborator_ids: updatedCollaborators })
    .eq('id', listId);

  if (error) {
    console.error('Erro ao remover colaborador:', error);
    throw new Error('Não foi possível remover o colaborador.');
  }
};

/**
 * Envia um convite para um usuário ser colaborador de uma lista.
 * Requer que o remetente seja o proprietário da lista.
 * @param listId ID da lista.
 * @param senderUserId ID do usuário que está enviando o convite.
 * @param recipientUserId ID do usuário que está sendo convidado.
 */
export const sendInvitation = async (listId: string, senderUserId: string, recipientUserId: string): Promise<void> => {
  await getListAndCheckAuthorization(listId, senderUserId, true);

  const { data: list, error: listFetchError } = await supabase
    .from('lists')
    .select('user_id, collaborator_ids')
    .eq('id', listId)
    .single();

  if (listFetchError || !list) {
    throw new Error('Lista não encontrada.');
  }

  if (list.user_id === recipientUserId || list.collaborator_ids?.includes(recipientUserId)) {
    throw new Error('Este usuário já tem acesso a esta lista.');
  }

  const { data: existingInvite } = await supabase
    .from('list_invitations')
    .select('id')
    .eq('list_id', listId)
    .eq('recipient_user_id', recipientUserId)
    .eq('status', 'pending')
    .single();

  if (existingInvite) {
    throw new Error('Já existe um convite pendente para este usuário nesta lista.');
  }

  const { error } = await supabase
    .from('list_invitations')
    .insert({
      list_id: listId,
      sender_user_id: senderUserId,
      recipient_user_id: recipientUserId,
      status: 'pending',
    });

  if (error) {
    console.error('Erro ao enviar convite:', error);
    throw new Error('Não foi possível enviar o convite. Tente novamente.');
  }
};

/**
 * Busca todos os convites pendentes para um usuário, incluindo o nome da lista e do remetente.
 * @param userId O ID do usuário para o qual buscar os convites.
 */
export const getPendingInvitationsForUser = async (userId: string): Promise<EnrichedListInvitation[]> => {
  const { data: invitations, error: invitesError } = await supabase
    .from('list_invitations')
    .select('id, status, list_id, sender_user_id')
    .eq('recipient_user_id', userId)
    .eq('status', 'pending');

  if (invitesError) {
    console.error('Erro ao buscar convites pendentes:', invitesError);
    throw new Error('Não foi possível buscar os convites.');
  }

  if (!invitations || invitations.length === 0) {
    return [];
  }

  const uniqueListIds = [...new Set(invitations.map(invite => invite.list_id))];
  const uniqueSenderIds = [...new Set(invitations.map(invite => invite.sender_user_id))];

  const { data: listsData } = await supabase.from('lists').select('id, name, description').in('id', uniqueListIds);
  const { data: profilesData } = await supabase.from('profiles').select('id, username').in('id', uniqueSenderIds);

  const listsMap = new Map(listsData?.map(list => [list.id, list]));
  const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]));

  const enrichedInvitations = invitations.map(invite => ({
    ...invite,
    // ✅ CORREÇÃO: A propriedade chama-se `lists` para corresponder à interface.
    lists: listsMap.get(invite.list_id) || null,
    sender_profile: profilesMap.get(invite.sender_user_id) || null,
  }));

  return enrichedInvitations as EnrichedListInvitation[];
};
  
/**
 * Aceita um convite para colaborar numa lista usando a função RPC segura.
 */
export const acceptInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase.rpc('accept_list_invitation', {
    p_invitation_id: invitationId,
  });

  if (error) {
    console.error('Erro ao aceitar convite via RPC:', error);
    throw new Error(error.message || 'Não foi possível aceitar o convite.');
  }
};

/**
 * Recusa (deleta) um convite pendente.
 */
export const declineInvitation = async (invitationId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('list_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('recipient_user_id', userId);

  if (error) {
    console.error('Erro ao rejeitar convite:', error);
    throw new Error('Não foi possível rejeitar o convite.');
  }
};