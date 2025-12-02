/**
 * Types pour l'entité Therapeutic-Indication (Indication Thérapeutique)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #2 : Types exports nommés
 * ✅ RÈGLE #4 : Étend BaseEntity (avec version et deletedAt)
 *
 * Pattern: Simple Reference Data (entité la plus complexe)
 * Relie un Produit avec une Espèce, un Pays, et une Voie d'Administration
 * Inclut un workflow de vérification (isVerified)
 */

import type { BaseEntity } from '../common/api'
import type { Product } from './product'
import type { Species } from './species'
import type { Country } from './country'
import type { AdministrationRoute } from './administration-route'

/**
 * Entité Therapeutic-Indication (Indication Thérapeutique)
 *
 * Pattern: Simple Reference Data
 * - ✅ Soft delete (deletedAt)
 * - ✅ Optimistic locking (version)
 * - ✅ Workflow de vérification (isVerified)
 * - ✅ Relations multiples (Product, Species, Country, Route)
 *
 * @example
 * ```typescript
 * const indication: TherapeuticIndication = {
 *   id: '123',
 *   code: 'AMOX-CAT-FR-ORAL',
 *   pathology: 'Infection respiratoire',
 *   productId: 'prod-123',
 *   speciesId: 'CAT',
 *   countryCode: 'FR',
 *   routeId: 'oral-123',
 *   isVerified: true,
 *   isActive: true,
 *   version: 1,
 *   createdAt: '2025-01-15T10:00:00.000Z',
 *   updatedAt: '2025-01-15T10:00:00.000Z',
 * }
 * ```
 */
export interface TherapeuticIndication extends BaseEntity {
  /**
   * Code unique de l'indication
   * Ex: AMOX-CAT-FR-ORAL
   * Pattern: {PRODUCT}-{SPECIES}-{COUNTRY}-{ROUTE}
   */
  code: string

  /**
   * Nom de la pathologie traitée
   * Ex: "Infection respiratoire", "Parasitose digestive"
   */
  pathology: string

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
   * Code du pays ISO 3166-1 alpha-2 (foreign key)
   * Ex: FR, DZ, TN, MA
   * Relation: Country
   */
  countryCode: string

  /**
   * ID de la voie d'administration (foreign key)
   * Relation: AdministrationRoute
   */
  routeId: string

  /**
   * Statut de vérification de l'indication
   * - true: Indication vérifiée et validée par un expert
   * - false: Indication en attente de vérification
   */
  isVerified: boolean

  /**
   * Dosage recommandé
   * Ex: "10 mg/kg"
   */
  dosage?: string

  /**
   * Fréquence d'administration
   * Ex: "2 fois par jour", "1 fois par semaine"
   */
  frequency?: string

  /**
   * Durée du traitement
   * Ex: "5 jours", "3 semaines"
   */
  duration?: string

  /**
   * Délai d'attente viande (en jours)
   * Temps à respecter avant abattage
   */
  withdrawalMeat?: number

  /**
   * Délai d'attente lait (en jours)
   * Temps à respecter avant collecte du lait
   */
  withdrawalMilk?: number

  /**
   * Délai d'attente œufs (en jours)
   * Temps à respecter avant collecte des œufs
   */
  withdrawalEggs?: number

  /**
   * Instructions détaillées d'utilisation
   * Texte long
   */
  instructions?: string

  /**
   * Contre-indications
   * Texte long
   */
  contraindications?: string

  /**
   * Avertissements et précautions
   * Texte long
   */
  warnings?: string

  /**
   * Relation vers le produit (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  product?: Product

  /**
   * Relation vers l'espèce (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  species?: Species

  /**
   * Relation vers le pays (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  country?: Country

  /**
   * Relation vers la voie d'administration (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  route?: AdministrationRoute
}

/**
 * DTO pour créer une nouvelle indication thérapeutique
 *
 * Opération: POST /api/v1/therapeutic-indications
 */
export interface CreateTherapeuticIndicationDto {
  /**
   * Code unique (requis)
   */
  code: string

  /**
   * Pathologie (requis)
   */
  pathology: string

  /**
   * ID du produit (requis)
   */
  productId: string

  /**
   * ID de l'espèce (requis)
   */
  speciesId: string

  /**
   * Code du pays (requis)
   */
  countryCode: string

  /**
   * ID de la voie d'administration (requis)
   */
  routeId: string

  /**
   * Vérifiée (par défaut: false)
   */
  isVerified?: boolean

  /**
   * Dosage (optionnel)
   */
  dosage?: string

  /**
   * Fréquence (optionnel)
   */
  frequency?: string

  /**
   * Durée (optionnel)
   */
  duration?: string

  /**
   * Délai viande (optionnel)
   */
  withdrawalMeat?: number

  /**
   * Délai lait (optionnel)
   */
  withdrawalMilk?: number

  /**
   * Délai œufs (optionnel)
   */
  withdrawalEggs?: number

  /**
   * Instructions (optionnel)
   */
  instructions?: string

  /**
   * Contre-indications (optionnel)
   */
  contraindications?: string

  /**
   * Avertissements (optionnel)
   */
  warnings?: string

  /**
   * Actif (par défaut: true)
   */
  isActive?: boolean
}

/**
 * DTO pour mettre à jour une indication thérapeutique
 *
 * ✅ RÈGLE #4 : Inclut version pour optimistic locking
 * Opération: PATCH /api/v1/therapeutic-indications/{id}
 */
export interface UpdateTherapeuticIndicationDto {
  /**
   * Code unique
   */
  code?: string

  /**
   * Pathologie
   */
  pathology?: string

  /**
   * ID du produit
   */
  productId?: string

  /**
   * ID de l'espèce
   */
  speciesId?: string

  /**
   * Code du pays
   */
  countryCode?: string

  /**
   * ID de la voie d'administration
   */
  routeId?: string

  /**
   * Vérifiée
   */
  isVerified?: boolean

  /**
   * Dosage
   */
  dosage?: string

  /**
   * Fréquence
   */
  frequency?: string

  /**
   * Durée
   */
  duration?: string

  /**
   * Délai viande
   */
  withdrawalMeat?: number

  /**
   * Délai lait
   */
  withdrawalMilk?: number

  /**
   * Délai œufs
   */
  withdrawalEggs?: number

  /**
   * Instructions
   */
  instructions?: string

  /**
   * Contre-indications
   */
  contraindications?: string

  /**
   * Avertissements
   */
  warnings?: string

  /**
   * Actif
   */
  isActive?: boolean

  /**
   * Version pour optimistic locking (obligatoire)
   * Le backend retourne 409 Conflict si mismatch
   */
  version: number
}
