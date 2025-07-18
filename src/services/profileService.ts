// arquivo: src/services/profileService.ts

import { supabase } from '../lib/supabaseClient';

// ✅ Definição da interface MemberProfile para ser usada em todo o serviço e nas páginas
export interface MemberProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

// --- Funções de Perfil (Avatar, Banner, Favoritos) ---

export const updateAvatarUrl = async (userId: string, avatarUrl: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) throw error;

  const { data: userUpdateData, error: userUpdateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  });

  if (userUpdateError) throw userUpdateError;

  return { data, userUpdateData };
};

export const updateProfileBanner = async (
    userId: string,
    movieId: number,
    backdropPath: string,
    position: string = 'center'
  ) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        banner_movie_id: movieId,
        banner_backdrop_path: backdropPath,
        banner_position: position
      })
      .eq('id', userId);

    if (error) throw error;
};

export const updateFavoriteMovieSlot = async (userId: string, slotIndex: number, movieId: number | null) => {
  const updatePayload = {
    [`fav_movie_id_${slotIndex + 1}`]: movieId,
  };

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId);

  if (error) {
    console.error(`Erro ao atualizar o slot ${slotIndex + 1}:`, error);
    throw error;
  }
};


// --- Funções Sociais ---

/**
 * Busca um perfil de utilizador pelo seu nome de utilizador público.
 */
export const getProfileByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    throw new Error('Utilizador não encontrado.');
  }
  return data;
};

/**
 * Um utilizador (follower) começa a seguir outro (following).
 */
export const followUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('friendships')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) throw error;
};

/**
 * Um utilizador (follower) deixa de seguir outro (following).
 */
export const unfollowUser = async (followerId: string, followingId: string) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) throw error;
};

/**
 * Verifica se o utilizador autenticado já segue o dono do perfil.
 */
export const checkFriendship = async (followerId: string, followingId:string): Promise<boolean> => {
  if (followerId === followingId) return false;

  const { data, error } = await supabase
    .from('friendships')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao verificar amizade:', error);
    return false;
  }

  return !!data;
};

/**
 * Busca os contadores de seguidores e de quem o utilizador segue.
 */
export const getFriendshipCounts = async (userId: string) => {
  const { count: followingCount, error: followingError } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  const { count: followersCount, error: followersError } = await supabase
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (followingError || followersError) {
    console.error('Erro ao buscar contagens de amizade:', followingError || followersError);
    return { following: 0, followers: 0 };
  }

  return { following: followingCount || 0, followers: followersCount || 0 };
};

/**
 * Busca todos os perfis de utilizadores para a página de membros.
 */
export const getAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url');

  if (error) {
    console.error('Erro ao buscar todos os perfis:', error);
    throw error;
  }
  return data;
};

// --- NOVAS FUNÇÕES PARA LISTAR SEGUIDORES E SEGUINDO ---

/**
 * Busca a lista de utilizadores que seguem o userId.
 * Retorna uma lista simplificada de perfis (id, username, avatar_url).
 */
export const getFollowers = async (userId: string): Promise<MemberProfile[]> => {
  // 1. Busca os IDs dos seguidores na tabela 'friendships'
  const { data: friendshipData, error: friendshipError } = await supabase
    .from('friendships')
    .select('follower_id') // Seleciona apenas o ID do seguidor
    .eq('following_id', userId); // O usuário atual é o "seguido"

  if (friendshipError) {
    console.error('Erro ao buscar IDs de seguidores:', friendshipError);
    throw friendshipError;
  }

  if (!friendshipData || friendshipData.length === 0) {
    return []; // Retorna um array vazio se não houver seguidores
  }

  const followerIds = friendshipData.map(item => item.follower_id);

  // 2. Busca os detalhes dos perfis usando os IDs coletados
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', followerIds); // Filtra perfis onde o ID está na lista de followerIds

  if (profilesError) {
    console.error('Erro ao buscar detalhes dos perfis dos seguidores:', profilesError);
    throw profilesError;
  }

  return profilesData || [];
};

/**
 * Busca a lista de utilizadores que o userId está seguindo.
 * Realiza a busca em duas etapas para contornar o erro de relacionamento.
 */
export const getFollowing = async (userId: string): Promise<MemberProfile[]> => {
  // 1. Busca os IDs dos usuários que o userId está seguindo na tabela 'friendships'
  const { data: friendshipData, error: friendshipError } = await supabase
    .from('friendships')
    .select('following_id') // Seleciona apenas o ID do usuário seguido
    .eq('follower_id', userId); // O usuário atual é o "seguidor"

  if (friendshipError) {
    console.error('Erro ao buscar IDs de usuários seguidos:', friendshipError);
    throw friendshipError;
  }

  if (!friendshipData || friendshipData.length === 0) {
    return []; // Retorna um array vazio se não estiver seguindo ninguém
  }

  const followingIds = friendshipData.map(item => item.following_id);

  // 2. Busca os detalhes dos perfis usando os IDs coletados
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', followingIds); // Filtra perfis onde o ID está na lista de followingIds

  if (profilesError) {
    console.error('Erro ao buscar detalhes dos perfis dos usuários seguidos:', profilesError);
    throw profilesError;
  }

  return profilesData || [];
};