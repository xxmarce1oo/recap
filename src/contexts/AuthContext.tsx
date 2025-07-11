// arquivo: src/contexts/AuthContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// ✅ PASSO 1: Definimos a interface COMPLETA do perfil, uma única vez.
export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  is_verified: boolean;
  banner_movie_id: number | null;
  banner_backdrop_path: string | null;
  banner_position: string | null;
  fav_movie_id_1: number | null;
  fav_movie_id_2: number | null;
  fav_movie_id_3: number | null;
  fav_movie_id_4: number | null;
}

interface AuthContextType {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Este useEffect corre apenas UMA VEZ para obter o estado inicial
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // ✅ PASSO 2: Buscamos TODAS as colunas do perfil com select('*')
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*') 
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile as Profile | null);
        }
      } catch (e) {
        console.error("Erro ao obter a sessão inicial:", e);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Este useEffect escuta MUDANÇAS (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('*') // ✅ Também buscamos o perfil completo aqui
            .eq('id', session.user.id)
            .single();
          setProfile(userProfile as Profile | null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    isLoading,
    session,
    user,
    profile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};