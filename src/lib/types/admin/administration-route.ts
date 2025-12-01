import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Voie d'administration - Route d'administration d'un produit vétérinaire
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * Définit comment un produit peut être administré à un animal.
 * Exemples : Orale, Injectable (SC/IM/IV), Topique, etc.
 *
 * @example
 * ```typescript
 * const route: AdministrationRoute = {
 *   id: 'uuid',
 *   code: 'ORAL',
 *   name: 'Voie orale',
 *   description: 'Administration par la bouche (comprimés, liquides)',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface AdministrationRoute extends BaseEntity {
  /**
   * Code unique de la voie d'administration (majuscules)
   * @example "ORAL", "SC", "IM", "IV", "TOPIQUE"
   */
  code: string

  /**
   * Nom de la voie d'administration
   * @example "Voie orale", "Injection sous-cutanée", "Application topique"
   */
  name: string

  /**
   * Description détaillée de la voie et de son usage
   * @example "Administration par la bouche sous forme de comprimés, gélules ou liquides"
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
 * DTO pour création d'une voie d'administration
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateAdministrationRouteDto {
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
 * DTO pour mise à jour d'une voie d'administration
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateAdministrationRouteDto {
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

/**
 * Paramètres de requête pour la liste des voies d'administration
 *
 * Hérite des paramètres de pagination standards
 */
export interface AdministrationRouteListParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 25) */
  limit?: number

  /** Terme de recherche full-text (code, name) */
  search?: string

  /** Inclure les voies supprimées (soft deleted) */
  includeDeleted?: boolean

  /** Champ de tri */
  sortBy?: 'code' | 'name' | 'createdAt' | 'updatedAt'

  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc'

  /** Filtrer par statut actif/inactif */
  isActive?: boolean
}
