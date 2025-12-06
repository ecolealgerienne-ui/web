import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  Breed,
  CreateBreedDto,
  UpdateBreedDto,
} from '@/lib/types/admin/breed'
import type {
  PaginatedResponse,
  PaginationParams,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Paramètres de filtrage pour les races
 *
 * ✅ RÈGLE #2 : Étend PaginationParams pour page, limit, sortBy, sortOrder
 */
export interface BreedFilterParams extends PaginationParams {
  /**
   * Filtrer par espèce (foreign key)
   * Pattern: Scoped Reference Data
   */
  speciesId?: string

  /**
   * Filtrer par statut actif/inactif
   */
  isActive?: boolean

  /**
   * Recherche full-text (code, nameFr, nameEn, nameAr, description)
   */
  search?: string

  /**
   * Champ de tri
   * Options: nameFr, nameEn, code, displayOrder, createdAt
   */
  sortBy?: 'nameFr' | 'nameEn' | 'code' | 'displayOrder' | 'createdAt'

  /**
   * Ordre de tri (ASC ou DESC)
   */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Service pour gérer les Races (Breeds)
 *
 * ✅ RÈGLE #4 : Implémente CrudService<Breed, CreateBreedDto, UpdateBreedDto>
 * ✅ RÈGLE #5 : Utilise apiClient pour toutes les requêtes
 * ✅ RÈGLE #5 : Utilise logger pour toutes les erreurs
 *
 * Pattern: Scoped Reference Data (Scope: Species)
 * API Base: /api/v1/breeds
 */
class BreedsService implements CrudService<Breed, CreateBreedDto, UpdateBreedDto> {
  private readonly basePath = '/api/v1/breeds'

  /**
   * Récupère toutes les races (paginées) avec filtres
   *
   * @param params - Paramètres de pagination et filtrage
   * @returns Promise<PaginatedResponse<Breed>>
   */
  async getAll(params: BreedFilterParams = {}): Promise<PaginatedResponse<Breed>> {
    try {
      const {
        page = 1,
        limit = 25,
        sortBy = 'nameFr',
        sortOrder = 'asc',
        speciesId,
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
      if (speciesId) queryParams.append('speciesId', speciesId)
      if (isActive !== undefined) queryParams.append('isActive', isActive.toString())
      if (search) queryParams.append('search', search)

      const response = await apiClient.get<PaginatedResponse<Breed>>(
        `${this.basePath}?${queryParams.toString()}`
      )

      logger.info('Breeds list fetched', {
        total: response.meta.total,
        page,
        limit,
        speciesId,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch breeds list', { error, params })
      throw error
    }
  }

  /**
   * Récupérer une race par son ID
   *
   * @param id - ID de la race
   * @returns Promise<Breed>
   */
  async getById(id: string): Promise<Breed> {
    try {
      const breed = await apiClient.get<Breed>(`${this.basePath}/${id}`)
      logger.info('Breed fetched', { id, code: breed.code })
      return breed
    } catch (error) {
      logger.error('Failed to fetch breed', { error, id })
      throw error
    }
  }

  /**
   * Créer une nouvelle race
   *
   * @param data - Données de création
   * @returns Promise<Breed>
   */
  async create(data: CreateBreedDto): Promise<Breed> {
    try {
      const breed = await apiClient.post<Breed>(this.basePath, data)
      logger.info('Breed created', { id: breed.id, code: breed.code })
      return breed
    } catch (error) {
      logger.error('Failed to create breed', { error, data })
      throw error
    }
  }

  /**
   * Mettre à jour une race existante
   *
   * @param id - ID de la race
   * @param data - Données de mise à jour (inclut version pour optimistic locking)
   * @returns Promise<Breed>
   */
  async update(id: string, data: UpdateBreedDto): Promise<Breed> {
    try {
      const breed = await apiClient.put<Breed>(`${this.basePath}/${id}`, data)
      logger.info('Breed updated', { id, code: breed.code, version: data.version })
      return breed
    } catch (error) {
      logger.error('Failed to update breed', { error, id, data })
      throw error
    }
  }

  /**
   * Supprimer une race (soft delete)
   *
   * @param id - ID de la race
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Breed deleted (soft)', { id })
    } catch (error) {
      logger.error('Failed to delete breed', { error, id })
      throw error
    }
  }

  /**
   * Restaurer une race supprimée
   *
   * @param id - ID de la race
   * @returns Promise<Breed>
   */
  async restore(id: string): Promise<Breed> {
    try {
      const breed = await apiClient.post<Breed>(`${this.basePath}/${id}/restore`)
      logger.info('Breed restored', { id, code: breed.code })
      return breed
    } catch (error) {
      logger.error('Failed to restore breed', { error, id })
      throw error
    }
  }

  /**
   * Vérifier les dépendances avant suppression
   *
   * @param id - ID de la race
   * @returns Promise<Record<string, number>> - Map des entités dépendantes et leur nombre
   *
   * @example
   * {
   *   "animals": 15,
   *   "breedCountries": 3,
   *   "farmBreedPreferences": 5
   * }
   */
  async checkDependencies(id: string): Promise<Record<string, number>> {
    try {
      const dependencies = await apiClient.get<Record<string, number>>(
        `${this.basePath}/${id}/dependencies`
      )
      logger.info('Breed dependencies checked', { id, dependencies })
      return dependencies
    } catch (error) {
      logger.error('Failed to check breed dependencies', { error, id })
      throw error
    }
  }
}

/**
 * Instance singleton du service Breeds
 * ✅ RÈGLE #4 : Export de l'instance, pas de la classe
 */
export const breedsService = new BreedsService()
