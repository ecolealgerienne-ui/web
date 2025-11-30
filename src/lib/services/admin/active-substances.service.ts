import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  ActiveSubstance,
  CreateActiveSubstanceDto,
  UpdateActiveSubstanceDto,
} from '@/lib/types/admin/active-substance'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les substances actives
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 *
 * @example
 * ```typescript
 * // Récupérer toutes les substances
 * const response = await activeSubstancesService.getAll({ page: 1, limit: 25 })
 *
 * // Créer une substance
 * const substance = await activeSubstancesService.create({
 *   code: 'AMOX',
 *   name: 'Amoxicilline',
 *   description: 'Antibiotique',
 *   isActive: true
 * })
 * ```
 */
class ActiveSubstancesService
  implements
    CrudService<
      ActiveSubstance,
      CreateActiveSubstanceDto,
      UpdateActiveSubstanceDto
    >
{
  private readonly baseUrl = '/api/v1/admin/active-substances'

  /**
   * Récupère toutes les substances actives avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de substances actives
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<ActiveSubstance>> {
    try {
      logger.info('Fetching active substances', { params })

      // Construire l'URL avec les query params
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      if (params?.search) queryParams.append('search', params.search)

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl

      const response = await apiClient.get<PaginatedResponse<ActiveSubstance>>(
        url
      )

      logger.info('Active substances fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch active substances', { error, params })
      throw error
    }
  }

  /**
   * Récupère une substance active par ID
   *
   * @param id - ID de la substance
   * @returns Substance active
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<ActiveSubstance> {
    try {
      logger.info('Fetching active substance by ID', { id })

      const substance = await apiClient.get<ActiveSubstance>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Active substance fetched successfully', {
        id,
        code: substance.code,
        name: substance.name,
      })

      return substance
    } catch (error) {
      logger.error('Failed to fetch active substance', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle substance active
   *
   * @param data - Données de la substance à créer
   * @returns Substance active créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateActiveSubstanceDto): Promise<ActiveSubstance> {
    try {
      logger.info('Creating active substance', {
        code: data.code,
        name: data.name,
      })

      const substance = await apiClient.post<ActiveSubstance>(
        this.baseUrl,
        data
      )

      logger.info('Active substance created successfully', {
        id: substance.id,
        code: substance.code,
        name: substance.name,
      })

      return substance
    } catch (error) {
      logger.error('Failed to create active substance', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une substance active existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de la substance
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Substance active mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateActiveSubstanceDto
  ): Promise<ActiveSubstance> {
    try {
      logger.info('Updating active substance', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const substance = await apiClient.patch<ActiveSubstance>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Active substance updated successfully', {
        id: substance.id,
        code: substance.code,
        oldVersion: data.version,
        newVersion: substance.version,
      })

      return substance
    } catch (error) {
      logger.error('Failed to update active substance', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une substance active (soft delete)
   *
   * La substance n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de la substance à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting active substance', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Active substance deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete active substance', { error, id })
      throw error
    }
  }

  /**
   * Restaure une substance active supprimée
   *
   * Enlève le flag deletedAt pour rendre la substance à nouveau active
   *
   * @param id - ID de la substance à restaurer
   * @returns Substance active restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<ActiveSubstance> {
    try {
      logger.info('Restoring active substance', { id })

      const substance = await apiClient.post<ActiveSubstance>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Active substance restored successfully', {
        id: substance.id,
        code: substance.code,
      })

      return substance
    } catch (error) {
      logger.error('Failed to restore active substance', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const activeSubstancesService = new ActiveSubstancesService()
