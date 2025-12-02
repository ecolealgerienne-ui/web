/**
 * Types pour l'entité Breed-Country (Race-Pays)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #2 : Types exports nommés
 *
 * Pattern: Junction Table (Many-to-Many)
 * Table de jonction entre Breeds et Countries
 * Pas de soft delete, juste isActive pour activer/désactiver les liens
 */

import type { Breed } from './breed'
import type { Country } from './country'

/**
 * Entité Breed-Country (association Race-Pays)
 *
 * Pattern: Junction Table
 * - ❌ Pas de deletedAt (pas de soft delete)
 * - ❌ Pas de version (pas d'optimistic locking)
 * - ✅ Champ isActive pour activer/désactiver
 * - ✅ Contrainte unique composite (breedId + countryCode)
 */
export interface BreedCountry {
  /**
   * ID unique (UUID)
   */
  id: string

  /**
   * ID de la race (foreign key)
   * Contrainte: composite unique avec countryCode
   */
  breedId: string

  /**
   * Code du pays ISO 3166-1 alpha-2 (foreign key)
   * Exemples: FR, DZ, TN, MA
   * Contrainte: composite unique avec breedId
   */
  countryCode: string

  /**
   * Statut actif/inactif du lien
   * - true: Lien actif et utilisable
   * - false: Lien désactivé mais conservé
   */
  isActive: boolean

  /**
   * Date de création de l'association (ISO string)
   */
  createdAt: string

  /**
   * Date de dernière mise à jour (ISO string)
   */
  updatedAt: string

  /**
   * Relation vers la race (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  breed?: Breed

  /**
   * Relation vers le pays (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  country?: Country
}

/**
 * DTO pour créer un lien Race-Pays (link)
 *
 * Opération: POST /api/v1/breed-countries/link
 */
export interface CreateBreedCountryDto {
  /**
   * ID de la race
   */
  breedId: string

  /**
   * Code du pays (ISO 3166-1 alpha-2)
   */
  countryCode: string

  /**
   * Statut actif/inactif (par défaut: true)
   */
  isActive?: boolean
}

/**
 * DTO pour mettre à jour un lien Race-Pays
 *
 * Opération: PATCH /api/v1/breed-countries/{id}
 * Utilisé principalement pour toggle isActive
 */
export interface UpdateBreedCountryDto {
  /**
   * Nouveau statut actif/inactif
   */
  isActive: boolean
}

/**
 * DTO pour délier une Race-Pays (unlink)
 *
 * Opération: POST /api/v1/breed-countries/unlink
 * Suppression définitive (pas de soft delete)
 */
export interface UnlinkBreedCountryDto {
  /**
   * ID de la race
   */
  breedId: string

  /**
   * Code du pays (ISO 3166-1 alpha-2)
   */
  countryCode: string
}
