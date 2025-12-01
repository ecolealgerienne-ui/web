import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Country,
  CreateCountryDto,
  UpdateCountryDto,
} from '@/lib/types/admin/country'
import type {
  CrudService,
  PaginatedResponse,
  PaginationParams,
} from '@/lib/types/common/api'

/**
 * Service CRUD pour les pays
 *
 * ✅ RÈGLE #2 : Utilise apiClient (jamais fetch directement)
 * ✅ RÈGLE #4 : Implémente CrudService<T, CreateDto, UpdateDto>
 * ✅ RÈGLE #7 : Logger toutes les opérations et erreurs
 *
 * @example
 * ```typescript
 * // Récupérer tous les pays
 * const response = await countriesService.getAll({ page: 1, limit: 25 })
 *
 * // Créer un pays
 * const country = await countriesService.create({
 *   code: 'DZA',
 *   nameFr: 'Algérie',
 *   nameEn: 'Algeria',
 *   nameAr: 'الجزائر',
 *   isoCode2: 'DZ',
 *   isoCode3: 'DZA',
 *   isActive: true
 * })
 * ```
 */
class CountriesService
  implements CrudService<Country, CreateCountryDto, UpdateCountryDto>
{
  private readonly baseUrl = '/api/v1/countries'

  /**
   * Récupère tous les pays avec pagination
   *
   * ✅ RÈGLE #4 : Retourne PaginatedResponse<T>
   *
   * @param params - Paramètres de pagination et filtres
   * @returns Liste paginée de pays
   * @throws {ApiError} Si l'API retourne une erreur
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Country>> {
    try {
      logger.info('Fetching countries', { params })

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

      const response = await apiClient.get<PaginatedResponse<Country>>(url)

      logger.info('Countries fetched successfully', {
        count: response.data.length,
        total: response.meta.total,
        page: response.meta.page,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch countries', { error, params })
      throw error
    }
  }

  /**
   * Récupère un pays par ID
   *
   * @param id - ID du pays
   * @returns Pays
   * @throws {ApiError} Si non trouvé (404) ou erreur serveur
   */
  async getById(id: string): Promise<Country> {
    try {
      logger.info('Fetching country by ID', { id })

      const country = await apiClient.get<Country>(`${this.baseUrl}/${id}`)

      logger.info('Country fetched successfully', {
        id,
        code: country.code,
        nameFr: country.nameFr,
      })

      return country
    } catch (error) {
      logger.error('Failed to fetch country', { error, id })
      throw error
    }
  }

  /**
   * Crée un nouveau pays
   *
   * @param data - Données du pays à créer
   * @returns Pays créé
   * @throws {ApiError} Si code déjà existant (409) ou validation échouée (400)
   */
  async create(data: CreateCountryDto): Promise<Country> {
    try {
      logger.info('Creating country', {
        code: data.code,
        nameFr: data.nameFr,
      })

      const country = await apiClient.post<Country>(this.baseUrl, data)

      logger.info('Country created successfully', {
        id: country.id,
        code: country.code,
        nameFr: country.nameFr,
      })

      return country
    } catch (error) {
      logger.error('Failed to create country', { error, data })
      throw error
    }
  }

  /**
   * Met à jour un pays existant
   *
   * ✅ RÈGLE #4 : Utilise version pour optimistic locking
   *
   * @param id - ID du pays
   * @param data - Données à mettre à jour (doit inclure version)
   * @returns Pays mis à jour
   * @throws {ApiError} Si version conflict (409) ou non trouvé (404)
   */
  async update(id: string, data: UpdateCountryDto): Promise<Country> {
    try {
      logger.info('Updating country', {
        id,
        version: data.version,
        changes: Object.keys(data).filter((k) => k !== 'version'),
      })

      const country = await apiClient.patch<Country>(
        `${this.baseUrl}/${id}`,
        data
      )

      logger.info('Country updated successfully', {
        id: country.id,
        code: country.code,
        oldVersion: data.version,
        newVersion: country.version,
      })

      return country
    } catch (error) {
      logger.error('Failed to update country', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime un pays (soft delete)
   *
   * Le pays n'est pas réellement supprimé de la DB,
   * il est marqué comme supprimé (deletedAt = timestamp)
   *
   * @param id - ID du pays à supprimer
   * @throws {ApiError} Si dépendances existent (409) ou non trouvé (404)
   */
  async delete(id: string): Promise<void> {
    try {
      logger.info('Deleting country', { id })

      await apiClient.delete(`${this.baseUrl}/${id}`)

      logger.info('Country deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete country', { error, id })
      throw error
    }
  }

  /**
   * Restaure un pays supprimé
   *
   * Enlève le flag deletedAt pour rendre le pays à nouveau actif
   *
   * @param id - ID du pays à restaurer
   * @returns Pays restauré
   * @throws {ApiError} Si non trouvé (404) ou non supprimé
   */
  async restore(id: string): Promise<Country> {
    try {
      logger.info('Restoring country', { id })

      const country = await apiClient.post<Country>(
        `${this.baseUrl}/${id}/restore`
      )

      logger.info('Country restored successfully', {
        id: country.id,
        code: country.code,
      })

      return country
    } catch (error) {
      logger.error('Failed to restore country', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service
 * Utiliser cette instance partout dans l'application
 */
export const countriesService = new CountriesService()
