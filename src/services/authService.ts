// arquivo: src/services/authService.ts

import { supabase } from '../lib/supabaseClient';

// A função de registro continua a mesma, está correta.
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        username: username,
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};


// ✅ FUNÇÃO DE LOGIN CORRIGIDA E COMPLETA
export const signIn = async (usernameOrEmail: string, password: string) => {
  let userEmail = usernameOrEmail;

  // 1. Verifica se o que o usuário digitou NÃO é um e-mail
  if (!usernameOrEmail.includes('@')) {
    // 2. Se não for um e-mail, chama a nossa nova função no Supabase
    const { data: email, error: rpcError } = await supabase
      .rpc('get_email_from_username', { p_username: usernameOrEmail });

    if (rpcError || !email) {
      // Se a função não retornar um e-mail, o usuário não existe.
      throw new Error("Credenciais de login inválidas");
    }
    
    // 3. Se encontrou, usa o e-mail retornado para o login
    userEmail = email;
  }

  // 4. Tenta fazer o login com o e-mail (seja o original ou o que encontramos)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: password,
  });

  if (error) {
    // O Supabase já retorna "Invalid login credentials" se a senha estiver errada
    throw new Error(error.message);
  }

  return data;
};


export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};