// arquivo: src/services/profileService.ts

import { supabase } from '../lib/supabaseClient';

// Função para atualizar a URL do avatar de um usuário específico
export const updateAvatarUrl = async (userId: string, avatarUrl: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    throw error;
  }
  
  // Também é uma boa prática atualizar os metadados do usuário na autenticação
  // para que a nova imagem apareça imediatamente em outros lugares.
  const { data: userUpdateData, error: userUpdateError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl }
  })

  if (userUpdateError) {
    throw userUpdateError;
  }

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

  