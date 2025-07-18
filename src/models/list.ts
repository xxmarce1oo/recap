// arquivo: src/models/list.ts

import { Movie } from './movie';

export interface UserList {
  id: string; // ID único da lista (gerado pelo banco de dados)
  user_id: string; // ID do usuário que criou a lista (proprietário)
  name: string; // Nome da lista (ex: "Meus Filmes Favoritos")
  description: string | null; // Descrição da lista
  movies_ids: number[]; // Array de IDs de filmes que fazem parte da lista
  collaborator_ids: string[]; // ✅ NOVO: Array de IDs de usuários colaboradores
  created_at: string; // Timestamp de criação
}

export interface EnrichedUserList extends Omit<UserList, 'movies_ids'> {
  movies: Movie[]; // Array de objetos Movie completos
}