import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Species,
  CreateSpeciesDto,
  UpdateSpeciesDto,
} from '@/lib/types/admin/species'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les espèces animales
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 *
 * @example
 * ```typescript
 * // Récupérer toutes les espèces
 * const response = await speciesService.getAll({ page: 1, limit: 25 })
 *
 * // Créer une espèce
 * const species = await speciesService.create({
 *   code: 'BOV',
 *   name: 'Bovin',
 *   description: 'Espèce bovine',
 *   isActive: true
 * })
 * ```
 */
class SpeciesService
  implements
    CrudService<
      Species,
      CreateSpeciesDto,
      UpdateSpeciesDto
    >
{
  private readonly baseUrl = '/api/v1/species'

  /**
   * Récupère toutes les espèces avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée d'espèces
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Species>> {
    try {
      logger.info('Fetching species', { params })

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

      const response = await apiClient.get<PaginatedResponse<Species>>(
        url
      )

      logger.info('Species fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch species', { error, params })
      throw error
    }
  }

  /**
   * Récupère une espèce par ID
   *
   * @param id - ID de l'espèce
   * @returns Espèce
   * @throws {ApiError} Si non trouvée (404) ou erreur serveur
   */
  async getById(id: string): Promise<Species> {
    try {
      logger.info('Fetching species by ID', { id })

      const species = await apiClient.get<Species>(
        `${this.baseUrl}/${id}`
      )

      logger.info('Species fetched successfully', {
        id,
        code: species.code,
        name: species.name,
      })

      return species
    } catch (error) {
      logger.error('Failed to fetch species', { error, id })
      throw error
    }
  }

  /**
   * Crée une nouvelle espèce
   *
   * @param data - Données de l'espèce à créer
   * @returns Espèce créée
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateSpeciesDto): Promise<Species> {
    try {
      logger.info('Creating species', {
        code: data.code,
        name: data.name,
      })

      const species = await apiClient.post<Species>(
        this.baseUrl,
        data
      )

      logger.info('Species created successfully', {
        id: species.id,
        code: species.code,
        name: species.name,
      })

      return species
    } catch (error) {
      logger.error('Failed to create species', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une espèce existante
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID de l'espèce
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Espèce mise à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvée (404)
   */
  async update(
    id: string,
    data: UpdateSpeciesDto
  ): Promise<Species> {
    try {
      logger.info('Updating species', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const species = await apiClient.patch<Species>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Species updated successfully', {
        id: species.id,
        code: species.code,
        oldVersion: data.version,
        newVersion: species.version,
      })

      return species
    } catch (error) {
      logger.error('Failed to update species', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une espèce (soft delete)
   *
   * L'espèce n'est pas réellement supprimée de la DB,
   * elle est marquée comme supprimée (deletedAt = timestamp)
   *
   * @param id - ID de l'espèce à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvée (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting species', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Species deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete species', { error, id })
      throw error
    }
  }

  /**
   * Restaure une espèce supprimée
   *
   * Enlève le flag deletedAt pour rendre l'espèce à nouveau active
   *
   * @param id - ID de l'espèce à restaurer
   * @returns Espèce restaurée
   * @throws {ApiError} Si non trouvée (404) ou non supprimée
   */
  async restore(id: string): Promise<Species> {
    try {
      logger.info('Restoring species', { id })

      const species = await apiClient.post<Species>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Species restored successfully', {
        id: species.id,
        code: species.code,
      })

      return species
    } catch (error) {
      logger.error('Failed to restore species', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const speciesService = new SpeciesService()
