import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  AgeCategory,
  CreateAgeCategoryDto,
  UpdateAgeCategoryDto,
} from '@/lib/types/admin/age-category'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Paramètres de filtrage spécifiques aux catégories d'âge
 */
export interface AgeCategoryFilterParams extends PaginationParams {
  /** Filtrer par espèce */
  speciesId?: string
  /** Filtrer par statut actif/inactif */
  isActive?: boolean
}

/**
 * Service CRUD pour les catégories d'âge
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 *
 * @example
 * ```typescript
 * // Récupérer toutes les catégories d'âge pour une espèce
 * const response = await ageCategoriesService.getAll({
 *   page: 1,
 *   limit: 25,
 *   speciesId: 'bovin-uuid'
 * })
 *
 * // Créer une catégorie d'âge
 * const ageCategory = await ageCategoriesService.create({
 *   code: 'VEAU',
 *   nameFr: 'Veau',
 *   nameEn: 'Calf',
 *   speciesId: 'bovin-uuid',
 *   ageMinDays: 0,
 *   ageMaxDays: 365,
 *   displayOrder: 1,
 *   isActive: true
 * })
 * ```
 */
class AgeCategoriesService
  implements
    CrudService<
      AgeCategory,
      CreateAgeCategoryDto,
      UpdateAgeCategoryDto
    >
{
  private readonly baseUrl = '/api/v1/age-categories'

  /**
   * Récupère toutes les catégories d'âge avec pagination et filtres
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de catégories d'âge
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: AgeCategoryFilterParams
  ): Promise<PaginatedResponse<AgeCategory>> {
    try {
      logger.info('Fetching age categories', { params })

      // Construire l'URL avec les query params
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.sortBy) queryParams.append('orderBy', params.sortBy)
      if (params?.sortOrder) {
        // ✅ RÈGLE #8.3.23 : Conversion sort order en majuscules pour API
        queryParams.append('order', params.sortOrder.toUpperCase())
      }
      if (params?.search) queryParams.append('search', params.search)
      if (params?.speciesId) queryParams.append('speciesId', params.speciesId)
      if (params?.isActive !== undefined) {
        queryParams.append('isActive', String(params.isActive))
      }

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams.toString()}`
        : this.baseUrl

      const response = await apiClient.get<PaginatedResponse<AgeCategory>>(
        url
      )

      logger.info('Age categories fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch age categories', { error, params })
      throw error
    }
  }

  /**
   * Récupère une catégorie d'âge par ID
   *
   * @param id - ID de la catégorie d'âge
   * @returns Catégorie d'âge
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<AgeCategory> {
    try {
      logger.info('Fetching age category by ID', { id })

      const ageCategory = await apiClient.get<AgeCategory>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Age category fetched successfully', {
        id,
        code: ageCategory.code,
        nameFr: ageCategory.nameFr,
      })

      return ageCategory
    } catch (error) {
      logger.error('Failed to fetch age category', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle catégorie d'âge
   *
   * @param data - Données de la catégorie d'âge à créer
   * @returns Catégorie d'âge créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateAgeCategoryDto): Promise<AgeCategory> {
    try {
      logger.info('Creating age category', {
        code: data.code,
        nameFr: data.nameFr,
        speciesId: data.speciesId,
      })

      const ageCategory = await apiClient.post<AgeCategory>(
        this.baseUrl,
        data
      )

      logger.info('Age category created successfully', {
        id: ageCategory.id,
        code: ageCategory.code,
        nameFr: ageCategory.nameFr,
      })

      return ageCategory
    } catch (error) {
      logger.error('Failed to create age category', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une catégorie d'âge existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de la catégorie d'âge
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Catégorie d'âge mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateAgeCategoryDto
  ): Promise<AgeCategory> {
    try {
      logger.info('Updating age category', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const ageCategory = await apiClient.patch<AgeCategory>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Age category updated successfully', {
        id: ageCategory.id,
        code: ageCategory.code,
        oldVersion: data.version,
        newVersion: ageCategory.version,
      })

      return ageCategory
    } catch (error) {
      logger.error('Failed to update age category', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une catégorie d'âge (soft delete)
   *
   * La catégorie n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de la catégorie d'âge à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting age category', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Age category deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete age category', { error, id })
      throw error
    }
  }

  /**
   * Restaure une catégorie d'âge supprimée
   *
   * Enlève le flag deletedAt pour rendre la catégorie à nouveau active
   *
   * @param id - ID de la catégorie d'âge à restaurer
   * @returns Catégorie d'âge restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<AgeCategory> {
    try {
      logger.info('Restoring age category', { id })

      const ageCategory = await apiClient.post<AgeCategory>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Age category restored successfully', {
        id: ageCategory.id,
        code: ageCategory.code,
      })

      return ageCategory
    } catch (error) {
      logger.error('Failed to restore age category', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const ageCategoriesService = new AgeCategoriesService()
