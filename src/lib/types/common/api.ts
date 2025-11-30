/**
 * Types communs pour les appels API et la pagination
 *
 * Ces types sont utilisés par TOUTES les entités admin
 * pour assurer la cohérence des interfaces.
 */

/**
 * Entité de base avec champs communs
 * Toutes les entités admin doivent étendre cette interface
 */
export interface BaseEntity {
  /** Identifiant unique */
  id: string

  /** Date de création (ISO 8601) */
  createdAt?: string

  /** Date de dernière modification (ISO 8601) */
  updatedAt?: string

  /** Date de suppression (soft delete) - null si non supprimé */
  deletedAt?: string | null

  /** Version pour optimistic locking */
  version?: number

  /** Indique si l'entité est active */
  isActive?: boolean
}

/**
 * Métadonnées de pagination
 */
export interface PaginationMeta {
  /** Nombre total d'éléments */
  total: number

  /** Page actuelle (1-indexed) */
  page: number

  /** Nombre d'éléments par page */
  limit: number

  /** Nombre total de pages */
  totalPages: number
}

/**
 * Réponse API paginée générique
 *
 * @template T - Type des éléments retournés
 *
 * @example
 * ```typescript
 * const response: PaginatedResponse<ActiveSubstance> = await api.get('/substances')
 * ```
 */
export interface PaginatedResponse<T> {
  /** Tableau des données */
  data: T[]

  /** Métadonnées de pagination */
  meta: PaginationMeta
}

/**
 * Paramètres de pagination et filtres
 *
 * Utilisé pour toutes les requêtes GET de listes
 */
export interface PaginationParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 25) */
  limit?: number

  /** Terme de recherche full-text */
  search?: string

  /** Inclure les éléments supprimés (soft deleted) */
  includeDeleted?: boolean

  /** Champ de tri (ex: 'code', 'name', 'createdAt') */
  sortBy?: string

  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Structure d'erreur API standardisée
 *
 * Correspond à la structure retournée par NestJS
 */
export interface ApiErrorResponse {
  /** Code de statut HTTP */
  statusCode: number

  /** Message(s) d'erreur */
  message: string | string[]

  /** Type d'erreur */
  error: string

  /** Timestamp de l'erreur */
  timestamp?: string

  /** Chemin de l'endpoint */
  path?: string

  /** Dépendances empêchant la suppression (pour 409 Conflict) */
  dependencies?: Record<string, number>
}

/**
 * Options de requête API
 */
export interface RequestOptions {
  /** Headers HTTP additionnels */
  headers?: Record<string, string>

  /** Timeout en millisecondes */
  timeout?: number

  /** Skip l'authentification (pour endpoints publics) */
  skipAuth?: boolean
}

/**
 * Interface générique pour les services CRUD
 *
 * @template T - Type de l'entité
 * @template CreateDto - Type du DTO de création
 * @template UpdateDto - Type du DTO de mise à jour
 */
export interface CrudService<T extends BaseEntity, CreateDto, UpdateDto> {
  /**
   * Récupère toutes les entités (paginées)
   */
  getAll(params?: PaginationParams): Promise<PaginatedResponse<T>>

  /**
   * Récupère une entité par ID
   */
  getById(id: string): Promise<T>

  /**
   * Crée une nouvelle entité
   */
  create(data: CreateDto): Promise<T>

  /**
   * Met à jour une entité existante
   */
  update(id: string, data: UpdateDto): Promise<T>

  /**
   * Supprime une entité (soft delete)
   */
  delete(id: string): Promise<void>

  /**
   * Restaure une entité supprimée
   */
  restore?(id: string): Promise<T>
}
