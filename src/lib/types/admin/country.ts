import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Pays - Référentiel géographique
 *
 * ✅ RÈGLE #4 : Étend BaseEntity
 *
 * Utilisé pour gérer les pays dans lesquels l'application opère.
 * Exemples : Algérie, France, Maroc, etc.
 *
 * @example
 * ```typescript
 * const country: Country = {
 *   id: 'uuid',
 *   code: 'DZA',
 *   nameFr: 'Algérie',
 *   nameEn: 'Algeria',
 *   nameAr: 'الجزائر',
 *   isoCode2: 'DZ',
 *   isoCode3: 'DZA',
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface Country extends BaseEntity {
  /**
   * Code unique du pays (généralement ISO 3166-1 alpha-3)
   * @example "DZA", "FRA", "MAR"
   */
  code: string

  /**
   * Nom du pays en français
   * @example "Algérie", "France", "Maroc"
   */
  nameFr: string

  /**
   * Nom du pays en anglais
   * @example "Algeria", "France", "Morocco"
   */
  nameEn: string

  /**
   * Nom du pays en arabe
   * @example "الجزائر", "فرنسا", "المغرب"
   */
  nameAr: string

  /**
   * Code ISO 3166-1 alpha-2 (2 lettres)
   * @example "DZ", "FR", "MA"
   */
  isoCode2: string

  /**
   * Code ISO 3166-1 alpha-3 (3 lettres)
   * @example "DZA", "FRA", "MAR"
   */
  isoCode3: string

  // Hérité de BaseEntity :
  // - id: string
  // - createdAt?: string
  // - updatedAt?: string
  // - deletedAt?: string | null
  // - version?: number
  // - isActive?: boolean
}

/**
 * DTO pour création d'un pays
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateCountryDto {
  /** Code unique (requis) */
  code: string

  /** Nom en français (requis) */
  nameFr: string

  /** Nom en anglais (requis) */
  nameEn: string

  /** Nom en arabe (requis) */
  nameAr: string

  /** Code ISO alpha-2 (requis) */
  isoCode2: string

  /** Code ISO alpha-3 (requis) */
  isoCode3: string

  /** Statut actif/inactif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'un pays
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateCountryDto {
  /** Code unique (optionnel) */
  code?: string

  /** Nom en français (optionnel) */
  nameFr?: string

  /** Nom en anglais (optionnel) */
  nameEn?: string

  /** Nom en arabe (optionnel) */
  nameAr?: string

  /** Code ISO alpha-2 (optionnel) */
  isoCode2?: string

  /** Code ISO alpha-3 (optionnel) */
  isoCode3?: string

  /** Statut actif/inactif (optionnel) */
  isActive?: boolean

  /**
   * Version actuelle (OBLIGATOIRE pour optimistic locking)
   * Si la version ne correspond pas, l'API retourne 409 Conflict
   */
  version: number
}

/**
 * Paramètres de requête pour la liste des pays
 *
 * Hérite des paramètres de pagination standards
 */
export interface CountryListParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 25) */
  limit?: number

  /** Terme de recherche full-text (code, noms) */
  search?: string

  /** Inclure les pays supprimés (soft deleted) */
  includeDeleted?: boolean

  /** Champ de tri */
  sortBy?: 'code' | 'nameFr' | 'nameEn' | 'nameAr' | 'createdAt' | 'updatedAt'

  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc'

  /** Filtrer par statut actif/inactif */
  isActive?: boolean
}
