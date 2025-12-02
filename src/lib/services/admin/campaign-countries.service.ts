import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  CampaignCountry,
  CreateCampaignCountryDto,
  UpdateCampaignCountryDto,
  UnlinkCampaignCountryDto,
} from '@/lib/types/admin/campaign-country'
import type { PaginatedResponse, PaginationParams } from '@/lib/types/common/api'

/**
 * Paramètres de filtrage pour les associations Campagne-Pays
 *
 * ✅ RÈGLE #2 : Étend PaginationParams pour page, limit, sortBy, sortOrder
 * Pattern: Junction Table (Many-to-Many)
 */
export interface CampaignCountryFilterParams extends PaginationParams {
  /**
   * Filtrer par campagne (foreign key)
   */
  campaignId?: string

  /**
   * Filtrer par pays (foreign key)
   */
  countryCode?: string

  /**
   * Filtrer par statut actif/inactif
   */
  isActive?: boolean

  /**
   * Recherche full-text
   * Cherche dans: campaign code, campaign names, country code, country names
   */
  search?: string

  /**
   * Champ de tri
   * Options: createdAt, updatedAt, isActive
   */
  sortBy?: 'createdAt' | 'updatedAt' | 'isActive'

  /**
   * Ordre de tri (asc ou desc)
   */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service pour gérer les associations Campagne-Pays (Campaign-Countries)
 *
 * ✅ RÈGLE #5 : Utilise apiClient pour toutes les requêtes
 * ✅ RÈGLE #5 : Utilise logger pour toutes les erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total (pas response.total)
 *
 * Pattern: Junction Table (Many-to-Many)
 * API Base: /api/v1/campaign-countries
 *
 * Opérations spéciales:
 * - link(): Créer un lien Campagne-Pays
 * - unlink(): Supprimer un lien (suppression définitive, pas de soft delete)
 * - toggleActive(): Activer/Désactiver un lien
 */
class CampaignCountriesService {
  private readonly basePath = '/api/v1/campaign-countries'

  /**
   * Récupère toutes les associations Campagne-Pays (paginées) avec filtres
   *
   * @param params - Paramètres de pagination et filtrage
   * @returns Promise<PaginatedResponse<CampaignCountry>>
   */
  async getAll(
    params: CampaignCountryFilterParams = {}
  ): Promise<PaginatedResponse<CampaignCountry>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'asc',
        campaignId,
        countryCode,
        isActive,
        search,
      } = params

      // Construire les query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        orderBy: sortBy,
        order: sortOrder.toUpperCase(), // ASC ou DESC
      })

      // Ajouter les filtres optionnels
      if (campaignId) queryParams.append('campaignId', campaignId)
      if (countryCode) queryParams.append('countryCode', countryCode)
      if (isActive !== undefined) queryParams.append('isActive', isActive.toString())
      if (search) queryParams.append('search', search)

      const response = await apiClient.get<PaginatedResponse<CampaignCountry>>(
        `${this.basePath}?${queryParams.toString()}`
      )

      logger.info('Campaign-Countries list fetched', {
        total: response.meta.total,
        page,
        limit,
        campaignId,
        countryCode,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch campaign-countries list', { error, params })
      throw error
    }
  }

  /**
   * Récupérer une association par son ID
   *
   * @param id - ID de l'association
   * @returns Promise<CampaignCountry>
   */
  async getById(id: string): Promise<CampaignCountry> {
    try {
      const campaignCountry = await apiClient.get<CampaignCountry>(`${this.basePath}/${id}`)
      logger.info('Campaign-Country association fetched', { id })
      return campaignCountry
    } catch (error) {
      logger.error('Failed to fetch campaign-country association', { error, id })
      throw error
    }
  }

  /**
   * Créer un lien Campagne-Pays (link)
   *
   * @param data - Données de création du lien
   * @returns Promise<CampaignCountry>
   *
   * @example
   * await campaignCountriesService.link({
   *   campaignId: 'campaign-uuid',
   *   countryCode: 'DZ',
   *   isActive: true
   * })
   */
  async link(data: CreateCampaignCountryDto): Promise<CampaignCountry> {
    try {
      const campaignCountry = await apiClient.post<CampaignCountry>(`${this.basePath}/link`, data)
      logger.info('Campaign-Country link created', {
        id: campaignCountry.id,
        campaignId: campaignCountry.campaignId,
        countryCode: campaignCountry.countryCode,
      })
      return campaignCountry
    } catch (error) {
      logger.error('Failed to create campaign-country link', { error, data })
      throw error
    }
  }

  /**
   * Supprimer un lien Campagne-Pays (unlink)
   * Suppression définitive (pas de soft delete)
   *
   * @param data - Données pour identifier le lien à supprimer
   * @returns Promise<void>
   *
   * @example
   * await campaignCountriesService.unlink({
   *   campaignId: 'campaign-uuid',
   *   countryCode: 'DZ'
   * })
   */
  async unlink(data: UnlinkCampaignCountryDto): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/unlink`, data)
      logger.info('Campaign-Country link deleted', {
        campaignId: data.campaignId,
        countryCode: data.countryCode,
      })
    } catch (error) {
      logger.error('Failed to delete campaign-country link', { error, data })
      throw error
    }
  }

  /**
   * Mettre à jour le statut actif/inactif d'un lien
   *
   * @param id - ID de l'association
   * @param data - Données de mise à jour
   * @returns Promise<CampaignCountry>
   *
   * @example
   * await campaignCountriesService.toggleActive('id', { isActive: false })
   */
  async toggleActive(id: string, data: UpdateCampaignCountryDto): Promise<CampaignCountry> {
    try {
      const campaignCountry = await apiClient.patch<CampaignCountry>(
        `${this.basePath}/${id}`,
        data
      )
      logger.info('Campaign-Country status toggled', {
        id,
        isActive: campaignCountry.isActive,
      })
      return campaignCountry
    } catch (error) {
      logger.error('Failed to toggle campaign-country status', { error, id, data })
      throw error
    }
  }

  /**
   * Supprimer définitivement une association par son ID
   * Alternative à unlink() quand on a l'ID directement
   *
   * @param id - ID de l'association
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Campaign-Country deleted by ID', { id })
    } catch (error) {
      logger.error('Failed to delete campaign-country by ID', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service Campaign-Countries
 * ✅ RÈGLE #4 : Export de l'instance, pas de la classe
 */
export const campaignCountriesService = new CampaignCountriesService()
