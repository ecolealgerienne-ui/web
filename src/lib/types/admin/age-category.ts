import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Catégorie d'âge pour une espèce animale
 *
 * ✅ RÈGLE #4 : Étend BaseEntity (Phase 1)
 *
 * Représente une catégorie d'âge associée à une espèce dans le système AniTra.
 * Permet de segmenter les animaux par tranches d'âge pour des recommandations adaptées.
 * Exemples : Veau (0-12 mois), Adulte (> 12 mois), Chiot (0-12 mois), etc.
 *
 * @example
 * ```typescript
 * const ageCategory: AgeCategory = {
 *   id: 'uuid',
 *   code: 'VEAU',
 *   nameFr: 'Veau',
 *   nameEn: 'Calf',
 *   nameAr: 'عجل',
 *   speciesId: 'species-uuid',
 *   ageMinDays: 0,
 *   ageMaxDays: 365,
 *   displayOrder: 1,
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2024-01-01T00:00:00Z',
 *   updatedAt: '2024-01-01T00:00:00Z',
 *   deletedAt: null
 * }
 * ```
 */
export interface AgeCategory extends BaseEntity {
  /**
   * Code unique de la catégorie d'âge (majuscules, chiffres, tirets, underscores)
   * @example "VEAU", "ADULTE", "SENIOR", "CHIOT", "ADULTE_OV"
   */
  code: string

  /**
   * Nom en français
   * @example "Veau", "Adulte", "Senior", "Chiot"
   */
  nameFr: string

  /**
   * Nom en anglais
   * @example "Calf", "Adult", "Senior", "Puppy"
   */
  nameEn: string

  /**
   * Nom en arabe (optionnel)
   * @example "عجل", "بالغ", "كبير السن", "جرو"
   */
  nameAr?: string

  /**
   * ID de l'espèce associée (foreign key)
   * @example "species-bovin-uuid"
   */
  speciesId: string

  /**
   * Âge minimum en jours
   * @example 0, 365, 730
   */
  ageMinDays: number

  /**
   * Âge maximum en jours (optionnel, null = pas de limite supérieure)
   * @example 365, 730, null
   */
  ageMaxDays?: number | null

  /**
   * Ordre d'affichage dans les listes
   * @example 1, 2, 3
   */
  displayOrder?: number

  // Hérité de BaseEntity :
  // - id: string
  // - createdAt?: string
  // - updatedAt?: string
  // - deletedAt?: string | null
  // - version?: number
  // - isActive?: boolean

  // Relations (optionnelles, chargées par l'API si incluses)
  /** Espèce associée (relation) */
  species?: {
    id: string
    code: string
    name: string
  }
}

/**
 * DTO pour création d'une catégorie d'âge
 *
 * Version minimale sans les champs auto-générés (id, dates, version)
 */
export interface CreateAgeCategoryDto {
  /** Code unique (requis) */
  code: string

  /** Nom en français (requis) */
  nameFr: string

  /** Nom en anglais (requis) */
  nameEn: string

  /** Nom en arabe (optionnel) */
  nameAr?: string

  /** ID de l'espèce associée (requis) */
  speciesId: string

  /** Âge minimum en jours (requis) */
  ageMinDays: number

  /** Âge maximum en jours (optionnel) */
  ageMaxDays?: number | null

  /** Ordre d'affichage (optionnel) */
  displayOrder?: number

  /** Statut actif/inactif (défaut: true) */
  isActive?: boolean
}

/**
 * DTO pour mise à jour d'une catégorie d'âge
 *
 * ✅ RÈGLE #4 : version obligatoire pour optimistic locking
 *
 * Tous les champs sont optionnels sauf `version` qui est requis
 * pour gérer les conflits de version (optimistic locking)
 */
export interface UpdateAgeCategoryDto {
  /** Code unique (optionnel) */
  code?: string

  /** Nom en français (optionnel) */
  nameFr?: string

  /** Nom en anglais (optionnel) */
  nameEn?: string

  /** Nom en arabe (optionnel) */
  nameAr?: string

  /** ID de l'espèce associée (optionnel) */
  speciesId?: string

  /** Âge minimum en jours (optionnel) */
  ageMinDays?: number

  /** Âge maximum en jours (optionnel) */
  ageMaxDays?: number | null

  /** Ordre d'affichage (optionnel) */
  displayOrder?: number

  /** Statut actif/inactif (optionnel) */
  isActive?: boolean

  /**
   * Version actuelle (OBLIGATOIRE pour optimistic locking)
   * Si la version ne correspond pas, l'API retourne 409 Conflict
   */
  version: number
}
