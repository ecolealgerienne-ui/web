import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  BreedCountry,
  CreateBreedCountryDto,
  UpdateBreedCountryDto,
  UnlinkBreedCountryDto,
} from '@/lib/types/admin/breed-country'
import type { PaginatedResponse, PaginationParams } from '@/lib/types/common/api'

/**
 * Paramètres de filtrage pour les associations Race-Pays
 *
 * ✅ RÈGLE #2 : Étend PaginationParams pour page, limit, sortBy, sortOrder
 * Pattern: Junction Table (Many-to-Many)
 */
export interface BreedCountryFilterParams extends PaginationParams {
  /**
   * Filtrer par race (foreign key)
   */
  breedId?: string

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
   * Cherche dans: breed code, breed names, country code, country names
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
 * Service pour gérer les associations Race-Pays (Breed-Countries)
 *
 * ✅ RÈGLE #5 : Utilise apiClient pour toutes les requêtes
 * ✅ RÈGLE #5 : Utilise logger pour toutes les erreurs
 * ✅ RÈGLE Section 8.3.24 : Utilise response.meta.total (pas response.total)
 *
 * Pattern: Junction Table (Many-to-Many)
 * API Base: /api/v1/breed-countries
 *
 * Opérations spéciales:
 * - link(): Créer un lien Race-Pays
 * - unlink(): Supprimer un lien (suppression définitive, pas de soft delete)
 * - toggleActive(): Activer/Désactiver un lien
 */
class BreedCountriesService {
  private readonly basePath = '/api/v1/breed-countries'

  /**
   * Récupère toutes les associations Race-Pays (paginées) avec filtres
   *
   * @param params - Paramètres de pagination et filtrage
   * @returns Promise<PaginatedResponse<BreedCountry>>
   */
  async getAll(params: BreedCountryFilterParams = {}): Promise<PaginatedResponse<BreedCountry>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'asc',
        breedId,
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
      if (breedId) queryParams.append('breedId', breedId)
      if (countryCode) queryParams.append('countryCode', countryCode)
      if (isActive !== undefined) queryParams.append('isActive', isActive.toString())
      if (search) queryParams.append('search', search)

      const response = await apiClient.get<PaginatedResponse<BreedCountry>>(
        `${this.basePath}?${queryParams.toString()}`
      )

      logger.info('Breed-Countries list fetched', {
        total: response.meta.total,
        page,
        limit,
        breedId,
        countryCode,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch breed-countries list', { error, params })
      throw error
    }
  }

  /**
   * Récupérer une association par son ID
   *
   * @param id - ID de l'association
   * @returns Promise<BreedCountry>
   */
  async getById(id: string): Promise<BreedCountry> {
    try {
      const breedCountry = await apiClient.get<BreedCountry>(`${this.basePath}/${id}`)
      logger.info('Breed-Country association fetched', { id })
      return breedCountry
    } catch (error) {
      logger.error('Failed to fetch breed-country association', { error, id })
      throw error
    }
  }

  /**
   * Créer un lien Race-Pays (link)
   *
   * @param data - Données de création du lien
   * @returns Promise<BreedCountry>
   *
   * @example
   * await breedCountriesService.link({
   *   breedId: 'breed-uuid',
   *   countryCode: 'DZ',
   *   isActive: true
   * })
   */
  async link(data: CreateBreedCountryDto): Promise<BreedCountry> {
    try {
      const breedCountry = await apiClient.post<BreedCountry>(`${this.basePath}/link`, data)
      logger.info('Breed-Country link created', {
        id: breedCountry.id,
        breedId: breedCountry.breedId,
        countryCode: breedCountry.countryCode,
      })
      return breedCountry
    } catch (error) {
      logger.error('Failed to create breed-country link', { error, data })
      throw error
    }
  }

  /**
   * Supprimer un lien Race-Pays (unlink)
   * Suppression définitive (pas de soft delete)
   *
   * @param data - Données pour identifier le lien à supprimer
   * @returns Promise<void>
   *
   * @example
   * await breedCountriesService.unlink({
   *   breedId: 'breed-uuid',
   *   countryCode: 'DZ'
   * })
   */
  async unlink(data: UnlinkBreedCountryDto): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/unlink`, data)
      logger.info('Breed-Country link deleted', {
        breedId: data.breedId,
        countryCode: data.countryCode,
      })
    } catch (error) {
      logger.error('Failed to delete breed-country link', { error, data })
      throw error
    }
  }

  /**
   * Mettre à jour le statut actif/inactif d'un lien
   *
   * @param id - ID de l'association
   * @param data - Données de mise à jour
   * @returns Promise<BreedCountry>
   *
   * @example
   * await breedCountriesService.toggleActive('id', { isActive: false })
   */
  async toggleActive(id: string, data: UpdateBreedCountryDto): Promise<BreedCountry> {
    try {
      const breedCountry = await apiClient.patch<BreedCountry>(`${this.basePath}/${id}`, data)
      logger.info('Breed-Country status toggled', {
        id,
        isActive: breedCountry.isActive,
      })
      return breedCountry
    } catch (error) {
      logger.error('Failed to toggle breed-country status', { error, id, data })
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
      logger.info('Breed-Country deleted by ID', { id })
    } catch (error) {
      logger.error('Failed to delete breed-country by ID', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service Breed-Countries
 * ✅ RÈGLE #4 : Export de l'instance, pas de la classe
 */
export const breedCountriesService = new BreedCountriesService()
