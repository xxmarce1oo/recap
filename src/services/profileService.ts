// ficheiro: src/services/profileService.ts

import { supabase } from '../lib/supabaseClient';

// --- Funções de Perfil (Avatar, Banner, Favoritos) - Sem alterações ---

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


// ✅ --- NOVAS FUNÇÕES SOCIAIS --- ✅

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

  if (error) {
    console.error('Erro ao seguir utilizador:', error);
    throw error;
  }
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

  if (error) {
    console.error('Erro ao deixar de seguir utilizador:', error);
    throw error;
  }
};

/**
 * Verifica se o utilizador autenticado já segue o dono do perfil.
 * @returns true se o utilizador segue, false caso contrário.
 */
export const checkFriendship = async (followerId: string, followingId: string): Promise<boolean> => {
  if (followerId === followingId) return false; // Não se pode seguir a si mesmo

  const { data, error } = await supabase
    .from('friendships')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle(); // Retorna um único resultado ou null, sem erro se não encontrar

  if (error) {
    console.error('Erro ao verificar amizade:', error);
    return false;
  }
  
  return !!data; // Retorna true se encontrou um registo, false se for null
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
    .select('id, username, avatar_url'); // Buscamos apenas os dados necessários

  if (error) {
    console.error('Erro ao buscar todos os perfis:', error);
    throw error;
  }
  return data;
};