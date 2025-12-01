import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Espèce animale
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * Représente une espèce animale dans le système AniTra.
 * Utilisée pour catégoriser les animaux dans les élevages.
 * Exemples : Bovin, Ovin, Caprin, Volaille, etc.
 *
 * @example
 * ```typescript
 * const species: Species = {
 *   id: 'uuid',
 *   code: 'BOV',
 *   name: 'Bovin',
 *   description: 'Espèce bovine (vaches, taureaux, veaux)',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface Species extends BaseEntity {
  /**
   * Code unique de l'espèce (majuscules, chiffres, tirets, underscores)
   * @example "BOV", "OVI", "CAP", "EQUI", "POUL"
   */
  code: string

  /**
   * Nom de l'espèce
   * @example "Bovin", "Ovin", "Caprin", "Équidé", "Volaille"
   */
  name: string

  /**
   * Description optionnelle de l'espèce
   * @example "Espèce bovine comprenant les vaches, taureaux, veaux et bœufs"
   */
  description?: string

  // Hérité de BaseEntity :
  // - id: string
  // - createdAt?: string
  // - updatedAt?: string
  // - deletedAt?: string | null
  // - version?: number
  // - isActive?: boolean
}

/**
 * DTO pour création d'une espèce
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateSpeciesDto {
  /** Code unique (requis) */
  code: string

  /** Nom (requis) */
  name: string

  /** Description (optionnel) */
  description?: string

  /** Statut actif/inactif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'une espèce
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateSpeciesDto {
  /** Code unique (optionnel) */
  code?: string

  /** Nom (optionnel) */
  name?: string

  /** Description (optionnel) */
  description?: string

  /** Statut actif/inactif (optionnel) */
  isActive?: boolean

  /**
   * Version actuelle (OBLIGATOIRE pour optimistic locking)
   * Si la version ne correspond pas, l'API retourne 409 Conflict
   */
  version: number
}
