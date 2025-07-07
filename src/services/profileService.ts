// arquivo: src/services/profileService.ts

import { supabase } from '../lib/supabaseClient';

// --- Funções de Avatar e Banner (sem alterações) ---

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


// ✅ FUNÇÃO NOVA E SIMPLIFICADA
// Atualiza uma única coluna de filme favorito com base no índice do slot.
export const updateFavoriteMovieSlot = async (userId: string, slotIndex: number, movieId: number | null) => {
  // Cria um objeto de atualização dinâmico. Ex: { fav_movie_id_2: 12345 }
  const updatePayload = {
    [`fav_movie_id_${slotIndex + 1}`]: movieId,
  };

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload) // Envia o payload simples. Ex: { fav_movie_id_1: 752 }
    .eq('id', userId);
  
  if (error) {
    console.error(`Erro ao atualizar o slot ${slotIndex + 1}:`, error);
    throw error;
  }
};