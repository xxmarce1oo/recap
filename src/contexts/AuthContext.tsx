// arquivo: src/contexts/AuthContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// ✅ Interface simplificada para evitar quaisquer conflitos de tipo
export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  is_verified?: boolean; // Opcional para não quebrar se a coluna não existir
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
    // Busca a sessão e o perfil apenas uma vez no carregamento inicial
    const getInitialData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('*') // Busca tudo para evitar erros de campos em falta
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          setProfile(userProfile as Profile | null);
        }
      } catch (error) {
        console.error("AuthContext Error on initial fetch:", error);
      } finally {
        // ✅ A GARANTIA: Esta linha é executada sempre, desbloqueando a aplicação.
        setIsLoading(false);
      }
    };

    getInitialData();

    // Escuta apenas as mudanças de login/logout futuras
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Se o utilizador fizer logout, o perfil será limpo na próxima recarga ou busca de dados.
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = { isLoading, session, user, profile, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};