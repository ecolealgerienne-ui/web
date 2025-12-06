import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Substance active pharmaceutique
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * Utilisée comme ingrédient actif dans les produits vétérinaires.
 * Exemples : Amoxicilline, Ivermectine, etc.
 *
 * @example
 * ```typescript
 * const substance: ActiveSubstance = {
 *   id: 'uuid',
 *   code: 'AMOX',
 *   name: 'Amoxicilline',
 *   description: 'Antibiotique à large spectre',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface ActiveSubstance extends BaseEntity {
  /**
   * Code unique de la substance (majuscules, chiffres, tirets, underscores)
   * @example "AMOX", "IVER", "FLUM"
   */
  code: string

  /**
   * Nom international (Dénomination Commune Internationale - DCI)
   * @example "Amoxicilline", "Ivermectine", "Fluméthasone"
   */
  name: string

  /**
   * Description optionnelle de la substance
   * @example "Antibiotique de la famille des bêta-lactamines"
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
 * DTO pour création d'une substance active
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateActiveSubstanceDto {
  /** Code unique (requis) */
  code: string

  /** Nom DCI (requis) */
  name: string

  /** Description (optionnel) */
  description?: string

  /** Statut actif/inactif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'une substance active
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateActiveSubstanceDto {
  /** Code unique (optionnel) */
  code?: string

  /** Nom DCI (optionnel) */
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
