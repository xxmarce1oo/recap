// arquivo: src/contexts/AuthContext.tsx

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// Define o tipo do que será compartilhado pelo contexto
interface AuthContextType {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => void;
}

// Cria o contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" do contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial do usuário
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Ouve as mudanças no estado de autenticação (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Função de limpeza para remover o "ouvinte" quando o componente é desmontado
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Função para fazer logout, que será usada no Header
  const signOut = async () => {
    await supabase.auth.signOut();
  }

  // O valor que será compartilhado com todos os componentes filhos
  const value = {
    isLoading,
    session,
    user,
    signOut,
  };

  // Retorna o provedor com os valores
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};