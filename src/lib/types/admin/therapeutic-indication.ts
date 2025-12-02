/**
 * Types pour l'entité Therapeutic-Indication (Indication Thérapeutique)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #2 : Types exports nommés
 * ✅ RÈGLE #4 : Étend BaseEntity (avec version et deletedAt)
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 * Relie un Produit avec une Espèce, une Catégorie d'Âge, un Pays, et une Voie d'Administration
 * Inclut un workflow de vérification (isVerified)
 */

import type { BaseEntity } from '../common/api'

/**
 * Entité Therapeutic-Indication (Indication Thérapeutique)
 *
 * Pattern: Simple Reference Data
 * - ✅ Soft delete (deletedAt)
 * - ✅ Optimistic locking (version)
 * - ✅ Workflow de vérification (isVerified)
 * - ✅ Relations multiples (Product, Species, AgeCategory, Country, Route, DoseUnit)
 *
 * @example
 * ```typescript
 * const indication: TherapeuticIndication = {
 *   id: '123',
 *   productId: 'prod-123',
 *   speciesId: 'caprine',
 *   ageCategoryId: 'age-123',
 *   countryCode: 'DZ',
 *   routeId: 'route-123',
 *   doseMin: 10,
 *   doseMax: 20,
 *   doseUnitId: 'unit-123',
 *   protocolDurationDays: 5,
 *   withdrawalMeatDays: 12,
 *   withdrawalMilkDays: 6,
 *   isVerified: false,
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2025-01-15T10:00:00.000Z',
 *   updatedAt: '2025-01-15T10:00:00.000Z',
 * }
 * ```
 */
export interface TherapeuticIndication extends BaseEntity {
  /**
   * ID du produit vétérinaire (foreign key)
   * Relation: Product
   */
  productId: string

  /**
   * ID de l'espèce animale (foreign key)
   * Relation: Species
   */
  speciesId: string

  /**
   * ID de la catégorie d'âge (foreign key, optionnel)
   * Relation: AgeCategory
   */
  ageCategoryId: string | null

  /**
   * Code du pays ISO 3166-1 alpha-2 (foreign key, optionnel)
   * Ex: FR, DZ, TN, MA
   * Relation: Country
   */
  countryCode: string | null

  /**
   * ID de la voie d'administration (foreign key)
   * Relation: AdministrationRoute
   */
  routeId: string

  /**
   * Dose minimale (optionnel)
   */
  doseMin: number | null

  /**
   * Dose maximale (optionnel)
   */
  doseMax: number | null

  /**
   * ID de l'unité de dosage (foreign key)
   * Relation: Unit
   */
  doseUnitId: string

  /**
   * Texte original de la posologie (optionnel)
   * Texte brut de la dose comme écrit dans la source
   */
  doseOriginalText: string | null

  /**
   * Durée du protocole en jours (optionnel)
   * Durée complète du traitement
   */
  protocolDurationDays: number | null

  /**
   * Délai d'attente pour la viande en jours (optionnel)
   * Temps à respecter avant abattage
   */
  withdrawalMeatDays: number | null

  /**
   * Délai d'attente pour le lait en jours (optionnel)
   * Temps à respecter avant collecte du lait
   */
  withdrawalMilkDays: number | null

  /**
   * Statut de vérification de l'indication
   * - true: Indication vérifiée et validée par un expert
   * - false: Indication en attente de vérification
   */
  isVerified: boolean

  /**
   * Notes de validation (optionnel)
   * Commentaires ou remarques lors de la validation
   */
  validationNotes: string | null
}

/**
 * DTO pour créer une nouvelle indication thérapeutique
 *
 * ✅ RÈGLE #5 : Types séparés pour Create/Update
 * Tous les champs requis pour la création (sauf BaseEntity fields)
 */
export interface CreateTherapeuticIndicationDto {
  productId: string
  speciesId: string
  ageCategoryId?: string | null
  countryCode?: string | null
  routeId: string
  doseMin?: number | null
  doseMax?: number | null
  doseUnitId: string
  doseOriginalText?: string | null
  protocolDurationDays?: number | null
  withdrawalMeatDays?: number | null
  withdrawalMilkDays?: number | null
  isVerified?: boolean
  validationNotes?: string | null
  isActive?: boolean
}

/**
 * DTO pour mettre à jour une indication thérapeutique
 *
 * ✅ RÈGLE #5 : Types séparés pour Create/Update
 * ✅ RÈGLE Section 8.3.4 : Version field obligatoire pour optimistic locking
 * Tous les champs optionnels
 */
export interface UpdateTherapeuticIndicationDto {
  productId?: string
  speciesId?: string
  ageCategoryId?: string | null
  countryCode?: string | null
  routeId?: string
  doseMin?: number | null
  doseMax?: number | null
  doseUnitId?: string
  doseOriginalText?: string | null
  protocolDurationDays?: number | null
  withdrawalMeatDays?: number | null
  withdrawalMilkDays?: number | null
  isVerified?: boolean
  validationNotes?: string | null
  isActive?: boolean
  version: number
}

/**
 * Type pour les données du formulaire (mapping avec validation Zod)
 *
 * ✅ Aligné avec therapeuticIndicationSchema
 */
export type TherapeuticIndicationFormData = Omit<CreateTherapeuticIndicationDto, 'isActive'> & {
  isActive: boolean
}
