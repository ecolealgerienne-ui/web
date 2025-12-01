/**
 * Service CRUD pour les Campagnes Nationales (Admin Reference Data)
 *
 * ✅ RÈGLE #1 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #7 : Logging de toutes les opérations
 * ✅ RÈGLE #7 : Gestion d'erreurs centralisée
 *
 * Implémente l'interface CrudService pour les campagnes nationales.
 * Endpoint API: /api/v1/national-campaigns
 *
 * @example
 * ```typescript
 * const campaigns = await nationalCampaignsService.getAll({ page: 1, limit: 20 })
 * const campaign = await nationalCampaignsService.create({ code: 'VACC2024', ... })
 * ```
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  NationalCampaign,
  CreateNationalCampaignDto,
  UpdateNationalCampaignDto,
  NationalCampaignFilterParams,
} from '@/lib/types/admin/national-campaign'
import type {
  PaginatedResponse,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Service de gestion des campagnes nationales
 *
 * Toutes les opérations utilisent apiClient et sont loggées.
 * Les erreurs sont propagées pour être gérées par handleApiError dans les hooks.
 */
class NationalCampaignsService
  implements
    CrudService<
      NationalCampaign,
      CreateNationalCampaignDto,
      UpdateNationalCampaignDto
    >
{
  private readonly baseUrl = '/api/v1/national-campaigns'

  /**
   * Récupère la liste paginée des campagnes nationales
   *
   * @param params - Paramètres de pagination, tri et filtres
   * @returns Liste paginée de campagnes nationales
   */
  async getAll(
    params?: NationalCampaignFilterParams
  ): Promise<PaginatedResponse<NationalCampaign>> {
    logger.info('Fetching national campaigns', { params })

    // Construire URL avec query params manuellement (RÈGLE 8.3.1)
    const queryParams = new URLSearchParams()

    // Pagination
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.limit) queryParams.append('limit', String(params.limit))

    // Recherche
    if (params?.search) queryParams.append('search', params.search)

    // Filtres spécifiques
    if (params?.type) queryParams.append('type', params.type)
    if (params?.isActive !== undefined)
      queryParams.append('isActive', String(params.isActive))

    // Tri
    if (params?.orderBy) queryParams.append('orderBy', params.orderBy)
    if (params?.order) queryParams.append('order', params.order)

    const url = queryParams.toString()
      ? `${this.baseUrl}?${queryParams.toString()}`
      : this.baseUrl

    const response = await apiClient.get<
      PaginatedResponse<NationalCampaign>
    >(url)

    logger.info('National campaigns fetched', {
      count: response.data.length,
      total: response.meta.total,
    })

    return response
  }

  /**
   * Récupère une campagne nationale par son ID
   *
   * @param id - ID de la campagne
   * @returns Campagne trouvée
   */
  async getById(id: string): Promise<NationalCampaign> {
    logger.info('Fetching national campaign by ID', { id })

    const response = await apiClient.get<NationalCampaign>(
      `${this.baseUrl}/${id}`
    )

    logger.info('National campaign fetched', { id, code: response.code })

    return response
  }

  /**
   * Crée une nouvelle campagne nationale
   *
   * @param dto - Données de la campagne à créer
   * @returns Campagne créée
   */
  async create(dto: CreateNationalCampaignDto): Promise<NationalCampaign> {
    logger.info('Creating national campaign', {
      code: dto.code,
      type: dto.type,
    })

    const response = await apiClient.post<NationalCampaign>(
      this.baseUrl,
      dto
    )

    logger.info('National campaign created', {
      id: response.id,
      code: response.code,
    })

    return response
  }

  /**
   * Met à jour une campagne nationale existante
   *
   * ⚠️ Requiert le champ version pour l'optimistic locking
   *
   * @param id - ID de la campagne
   * @param dto - Données à mettre à jour (doit inclure version)
   * @returns Campagne mise à jour
   */
  async update(
    id: string,
    dto: UpdateNationalCampaignDto
  ): Promise<NationalCampaign> {
    logger.info('Updating national campaign', {
      id,
      version: dto.version,
    })

    const response = await apiClient.patch<NationalCampaign>(
      `${this.baseUrl}/${id}`,
      dto
    )

    logger.info('National campaign updated', {
      id: response.id,
      newVersion: response.version,
    })

    return response
  }

  /**
   * Supprime une campagne nationale (soft delete)
   *
   * La campagne n'est pas supprimée de la base de données,
   * mais marquée comme supprimée (deletedAt = timestamp).
   *
   * @param id - ID de la campagne à supprimer
   */
  async delete(id: string): Promise<void> {
    logger.info('Deleting national campaign', { id })

    await apiClient.delete(`${this.baseUrl}/${id}`)

    logger.info('National campaign deleted (soft)', { id })
  }

  /**
   * Restaure une campagne nationale supprimée
   *
   * Réactive une campagne précédemment supprimée (deletedAt = null).
   *
   * @param id - ID de la campagne à restaurer
   * @returns Campagne restaurée
   */
  async restore(id: string): Promise<NationalCampaign> {
    logger.info('Restoring national campaign', { id })

    const response = await apiClient.post<NationalCampaign>(
      `${this.baseUrl}/${id}/restore`
    )

    logger.info('National campaign restored', { id })

    return response
  }
}

/**
 * Instance singleton du service
 *
 * À utiliser dans les hooks et composants:
 * ```typescript
 * import { nationalCampaignsService } from '@/lib/services/admin/national-campaigns.service'
 * ```
 */
export const nationalCampaignsService = new NationalCampaignsService()
