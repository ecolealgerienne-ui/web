/**
 * Types pour les Campagnes Nationales (Admin Reference Data)
 *
 * Entité de référence administrative pour les campagnes de santé animale nationales.
 *
 * Sprint 1 - Entité indépendante (pas de dépendances sur d'autres entités)
 */

import type { BaseEntity } from '@/lib/types/common/api'

/**
 * Types de campagnes nationales
 */
export type CampaignType =
  | 'vaccination'
  | 'deworming'
  | 'screening'
  | 'treatment'
  | 'census'
  | 'other'

/**
 * Campagne Nationale (Admin Reference Data)
 *
 * Représente une campagne de santé animale au niveau national.
 * Utilisé pour définir des campagnes de vaccination, déparasitage, dépistage, etc.
 */
export interface NationalCampaign extends BaseEntity {
  /**
   * Code unique de la campagne (ex: "VACC2024", "DEWORM-2024-Q1")
   * Format: lettres majuscules, chiffres, tirets et underscores
   */
  code: string

  /**
   * Nom de la campagne en français
   */
  nameFr: string

  /**
   * Nom de la campagne en anglais
   */
  nameEn: string

  /**
   * Nom de la campagne en arabe
   */
  nameAr: string

  /**
   * Type de campagne
   */
  type: CampaignType

  /**
   * Date de début de la campagne (ISO 8601)
   */
  startDate: string

  /**
   * Date de fin de la campagne (ISO 8601)
   */
  endDate: string

  /**
   * Description de la campagne (optionnel)
   */
  description?: string
}

/**
 * DTO pour la création d'une campagne nationale
 */
export interface CreateNationalCampaignDto {
  code: string
  nameFr: string
  nameEn: string
  nameAr: string
  type: CampaignType
  startDate: string
  endDate: string
  description?: string
  isActive?: boolean
}

/**
 * DTO pour la mise à jour d'une campagne nationale
 * Inclut le champ version pour l'optimistic locking
 */
export interface UpdateNationalCampaignDto {
  code?: string
  nameFr?: string
  nameEn?: string
  nameAr?: string
  type?: CampaignType
  startDate?: string
  endDate?: string
  description?: string
  isActive?: boolean
  version: number
}

/**
 * Paramètres de filtrage spécifiques aux campagnes nationales
 * Étend les paramètres de pagination avec des filtres métier
 */
export interface NationalCampaignFilterParams {
  /** Numéro de page (1-indexed, défaut: 1) */
  page?: number

  /** Nombre d'éléments par page (défaut: 20, max: 100) */
  limit?: number

  /** Recherche dans code et noms (nameFr, nameEn, nameAr) */
  search?: string

  /** Filtrer par type de campagne */
  type?: CampaignType

  /** Filtrer par statut actif */
  isActive?: boolean

  /** Champ de tri (défaut: startDate) */
  orderBy?: 'nameFr' | 'nameEn' | 'code' | 'startDate' | 'endDate' | 'type' | 'createdAt'

  /** Ordre de tri (défaut: DESC) */
  order?: 'ASC' | 'DESC'
}
