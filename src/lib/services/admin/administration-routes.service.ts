import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  AdministrationRoute,
  CreateAdministrationRouteDto,
  UpdateAdministrationRouteDto,
} from '@/lib/types/admin/administration-route'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les voies d'administration
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 *
 * @example
 * ```typescript
 * // Récupérer toutes les voies d'administration
 * const response = await administrationRoutesService.getAll({ page: 1, limit: 25 })
 *
 * // Créer une voie d'administration
 * const route = await administrationRoutesService.create({
 *   code: 'ORAL',
 *   name: 'Voie orale',
 *   description: 'Administration par la bouche',
 *   isActive: true
 * })
 * ```
 */
class AdministrationRoutesService
  implements
    CrudService<
      AdministrationRoute,
      CreateAdministrationRouteDto,
      UpdateAdministrationRouteDto
    >
{
  private readonly baseUrl = '/api/v1/administration-routes'

  /**
   * Récupère toutes les voies d'administration avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de voies d'administration
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<AdministrationRoute>> {
    try {
      logger.info('Fetching administration routes', { params })

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

      const response = await apiClient.get<PaginatedResponse<AdministrationRoute>>(
        url
      )

      logger.info('Administration routes fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch administration routes', { error, params })
      throw error
    }
  }

  /**
   * Récupère une voie d'administration par ID
   *
   * @param id - ID de la voie d'administration
   * @returns Voie d'administration
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<AdministrationRoute> {
    try {
      logger.info('Fetching administration route by ID', { id })

      const route = await apiClient.get<AdministrationRoute>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Administration route fetched successfully', {
        id,
        code: route.code,
        name: route.name,
      })

      return route
    } catch (error) {
      logger.error('Failed to fetch administration route', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle voie d'administration
   *
   * @param data - Données de la voie à créer
   * @returns Voie d'administration créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateAdministrationRouteDto): Promise<AdministrationRoute> {
    try {
      logger.info('Creating administration route', {
        code: data.code,
        name: data.name,
      })

      const route = await apiClient.post<AdministrationRoute>(
        this.baseUrl,
        data
      )

      logger.info('Administration route created successfully', {
        id: route.id,
        code: route.code,
        name: route.name,
      })

      return route
    } catch (error) {
      logger.error('Failed to create administration route', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une voie d'administration existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de la voie d'administration
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Voie d'administration mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateAdministrationRouteDto
  ): Promise<AdministrationRoute> {
    try {
      logger.info('Updating administration route', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const route = await apiClient.patch<AdministrationRoute>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Administration route updated successfully', {
        id: route.id,
        code: route.code,
        oldVersion: data.version,
        newVersion: route.version,
      })

      return route
    } catch (error) {
      logger.error('Failed to update administration route', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une voie d'administration (soft delete)
   *
   * La voie n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de la voie à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting administration route', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Administration route deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete administration route', { error, id })
      throw error
    }
  }

  /**
   * Restaure une voie d'administration supprimée
   *
   * Enlève le flag deletedAt pour rendre la voie à nouveau active
   *
   * @param id - ID de la voie à restaurer
   * @returns Voie d'administration restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<AdministrationRoute> {
    try {
      logger.info('Restoring administration route', { id })

      const route = await apiClient.post<AdministrationRoute>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Administration route restored successfully', {
        id: route.id,
        code: route.code,
      })

      return route
    } catch (error) {
      logger.error('Failed to restore administration route', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const administrationRoutesService = new AdministrationRoutesService()
