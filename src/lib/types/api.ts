/**
 * Types pour les réponses API standardisées
 *
 * D'après WEB_API_SPECIFICATIONS.md, l'API retourne :
 * - Format paginé: { data: T[], total: number, limit: number, offset: number }
 * - Format single: objet T directement
 * - Naming: camelCase strict
 */

/**
 * Réponse paginée standard de l'API
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Réponse simple (single resource)
 * L'API retourne l'objet directement avec timestamps
 */
export interface ApiResource {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Wrapper optionnel pour réponses avec metadata
 */
export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

/**
 * Réponse d'erreur API
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
