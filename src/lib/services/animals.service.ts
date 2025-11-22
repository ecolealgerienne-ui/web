/**
 * Service API pour la gestion des animaux
 *
 * Ce service communique avec l'API backend sur localhost:3000
 * et gère toutes les opérations CRUD sur les animaux.
 */

import { apiClient } from '@/lib/api/client'
import { Animal, AnimalFilters } from '@/lib/types/animal'
import { logger } from '@/lib/utils/logger'

// TEMPORAIRE: FarmId simulé en attendant l'authentification
// TODO: Récupérer le farmId depuis le contexte utilisateur après login
const TEMP_FARM_ID = '00000000-0000-0000-0000-000000000001'

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface CreateAnimalDto {
  eid: string
  internalId?: string
  name?: string
  species: string
  breedId?: string
  sex: string
  birthDate: string
  motherId?: string
  fatherId?: string
  acquisitionDate: string
  acquisitionType: string
  currentWeight?: number
}

interface UpdateAnimalDto extends Partial<CreateAnimalDto> {
  status?: string
  lotId?: string
}

class AnimalsService {
  private basePath = `/farms/${TEMP_FARM_ID}/animals`

  /**
   * Récupère la liste des animaux avec filtres et pagination
   */
  async getAll(filters: AnimalFilters = {}, page = 1, limit = 50): Promise<PaginatedResponse<Animal>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Ajouter les filtres à la query string
      if (filters.species) params.append('species', filters.species)
      if (filters.sex) params.append('sex', filters.sex)
      if (filters.status) params.append('status', filters.status)
      if (filters.lotId) params.append('lotId', filters.lotId)
      if (filters.search) params.append('search', filters.search)

      // Le backend retourne: { data: [], meta: {} } (déjà déballé par apiClient)
      const backendResponse = await apiClient.get<{ data: Animal[], meta: any }>(
        `${this.basePath}?${params.toString()}`
      )

      // Adapter le format de réponse: renommer "meta" en "pagination"
      const response: PaginatedResponse<Animal> = {
        data: backendResponse.data || [],
        pagination: {
          page: backendResponse.meta?.page || page,
          limit: backendResponse.meta?.limit || limit,
          total: backendResponse.meta?.total || 0,
          totalPages: backendResponse.meta?.totalPages || 0,
        }
      }

      logger.info('Animals fetched successfully', {
        count: response.data.length,
        page,
        total: response.pagination.total
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch animals', { error, filters })
      throw error
    }
  }

  /**
   * Récupère un animal par son ID
   */
  async getById(id: string): Promise<Animal> {
    try {
      const animal = await apiClient.get<Animal>(`${this.basePath}/${id}`)
      logger.info('Animal fetched', { animalId: id })
      return animal
    } catch (error) {
      logger.error('Failed to fetch animal', { error, animalId: id })
      throw error
    }
  }

  /**
   * Crée un nouvel animal
   */
  async create(data: CreateAnimalDto): Promise<Animal> {
    try {
      const animal = await apiClient.post<Animal>(this.basePath, data)
      logger.info('Animal created', { animalId: animal.id, eid: data.eid })
      return animal
    } catch (error) {
      logger.error('Failed to create animal', { error, data })
      throw error
    }
  }

  /**
   * Met à jour un animal
   */
  async update(id: string, data: UpdateAnimalDto): Promise<Animal> {
    try {
      const animal = await apiClient.put<Animal>(`${this.basePath}/${id}`, data)
      logger.info('Animal updated', { animalId: id })
      return animal
    } catch (error) {
      logger.error('Failed to update animal', { error, animalId: id, data })
      throw error
    }
  }

  /**
   * Supprime un animal (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Animal deleted', { animalId: id })
    } catch (error) {
      logger.error('Failed to delete animal', { error, animalId: id })
      throw error
    }
  }

  /**
   * Met à jour le farmId (sera utilisé après authentification)
   */
  setFarmId(farmId: string) {
    ;(this.basePath as any) = `/farms/${farmId}/animals`
  }
}

// Instance singleton du service
export const animalsService = new AnimalsService()
