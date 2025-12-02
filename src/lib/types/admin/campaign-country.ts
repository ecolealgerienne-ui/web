/**
 * Types pour l'entité Campaign-Country (Campagne-Pays)
 *
 * ✅ RÈGLE #1 : Aucune valeur en dur
 * ✅ RÈGLE #2 : Types exports nommés
 *
 * Pattern: Junction Table (Many-to-Many)
 * Table de jonction entre National Campaigns et Countries
 * Pas de soft delete, juste isActive pour activer/désactiver les liens
 */

import type { NationalCampaign } from './national-campaign'
import type { Country } from './country'

/**
 * Entité Campaign-Country (association Campagne-Pays)
 *
 * Pattern: Junction Table
 * - ❌ Pas de deletedAt (pas de soft delete)
 * - ❌ Pas de version (pas d'optimistic locking)
 * - ✅ Champ isActive pour activer/désactiver
 * - ✅ Contrainte unique composite (campaignId + countryCode)
 */
export interface CampaignCountry {
  /**
   * ID unique (UUID)
   */
  id: string

  /**
   * ID de la campagne nationale (foreign key)
   * Contrainte: composite unique avec countryCode
   */
  campaignId: string

  /**
   * Code du pays ISO 3166-1 alpha-2 (foreign key)
   * Exemples: FR, DZ, TN, MA
   * Contrainte: composite unique avec campaignId
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
   * Relation vers la campagne (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  campaign?: NationalCampaign

  /**
   * Relation vers le pays (incluse si populate)
   * Optionnelle car pas toujours chargée
   */
  country?: Country
}

/**
 * DTO pour créer un lien Campagne-Pays (link)
 *
 * Opération: POST /api/v1/campaign-countries/link
 */
export interface CreateCampaignCountryDto {
  /**
   * ID de la campagne nationale
   */
  campaignId: string

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
 * DTO pour mettre à jour un lien Campagne-Pays
 *
 * Opération: PATCH /api/v1/campaign-countries/{id}
 * Utilisé principalement pour toggle isActive
 */
export interface UpdateCampaignCountryDto {
  /**
   * Nouveau statut actif/inactif
   */
  isActive: boolean
}

/**
 * DTO pour délier une Campagne-Pays (unlink)
 *
 * Opération: POST /api/v1/campaign-countries/unlink
 * Suppression définitive (pas de soft delete)
 */
export interface UnlinkCampaignCountryDto {
  /**
   * ID de la campagne nationale
   */
  campaignId: string

  /**
   * Code du pays (ISO 3166-1 alpha-2)
   */
  countryCode: string
}
