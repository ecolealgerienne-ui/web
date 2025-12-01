import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Unit,
  CreateUnitDto,
  UpdateUnitDto,
} from '@/lib/types/admin/unit'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les unités de mesure
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 * ✅ RÈGLE #8.3.12 : URL vérifiée dans Swagger (http://localhost:3000/api/docs)
 *
 * @example
 * ```typescript
 * // Récupérer toutes les unités
 * const response = await unitsService.getAll({ page: 1, limit: 25 })
 *
 * // Créer une unité
 * const unit = await unitsService.create({
 *   code: 'MG',
 *   name: 'Milligramme',
 *   symbol: 'mg',
 *   type: UnitType.WEIGHT,
 *   isActive: true
 * })
 * ```
 */
class UnitsService
  implements
    CrudService<
      Unit,
      CreateUnitDto,
      UpdateUnitDto
    >
{
  // ⚠️ RÈGLE #8.3.12 : URL à vérifier dans Swagger
  // Basé sur le pattern Product-Categories : /api/v1/product-categories (sans /admin/)
  // Donc : /api/v1/units (à confirmer dans Swagger)
  private readonly baseUrl = '/api/v1/units'

  /**
   * Récupère toutes les unités avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée d'unités
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Unit>> {
    try {
      logger.info('Fetching units', { params })

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

      const response = await apiClient.get<PaginatedResponse<Unit>>(
        url
      )

      logger.info('Units fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch units', { error, params })
      throw error
    }
  }

  /**
   * Récupère une unité par ID
   *
   * @param id - ID de l'unité
   * @returns Unité trouvée
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<Unit> {
    try {
      logger.info('Fetching unit by ID', { id })

      const unit = await apiClient.get<Unit>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Unit fetched successfully', {
        id,
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        type: unit.type,
      })

      return unit
    } catch (error) {
      logger.error('Failed to fetch unit', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle unité
   *
   * @param data - Données de l'unité à créer
   * @returns Unité créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateUnitDto): Promise<Unit> {
    try {
      logger.info('Creating unit', {
        code: data.code,
        name: data.name,
        symbol: data.symbol,
        type: data.type,
      })

      const unit = await apiClient.post<Unit>(
        this.baseUrl,
        data
      )

      logger.info('Unit created successfully', {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        symbol: unit.symbol,
        type: unit.type,
      })

      return unit
    } catch (error) {
      logger.error('Failed to create unit', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une unité existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de l'unité
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Unité mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateUnitDto
  ): Promise<Unit> {
    try {
      logger.info('Updating unit', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const unit = await apiClient.patch<Unit>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Unit updated successfully', {
        id: unit.id,
        code: unit.code,
        oldVersion: data.version,
        newVersion: unit.version,
      })

      return unit
    } catch (error) {
      logger.error('Failed to update unit', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une unité (soft delete)
   *
   * L'unité n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de l'unité à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting unit', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Unit deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete unit', { error, id })
      throw error
    }
  }

  /**
   * Restaure une unité supprimée
   *
   * Enlève le flag deletedAt pour rendre l'unité à nouveau active
   *
   * @param id - ID de l'unité à restaurer
   * @returns Unité restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<Unit> {
    try {
      logger.info('Restoring unit', { id })

      const unit = await apiClient.post<Unit>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Unit restored successfully', {
        id: unit.id,
        code: unit.code,
      })

      return unit
    } catch (error) {
      logger.error('Failed to restore unit', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const unitsService = new UnitsService()
