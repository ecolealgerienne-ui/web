/**
 * Service API pour la gestion des races
 */

import { apiClient } from '@/lib/api/client'
import { Breed, CreateBreedDto, UpdateBreedDto } from '@/lib/types/breed'
import { logger } from '@/lib/utils/logger'

class BreedsService {
  private basePath = '/api/breeds'

  /**
   * Récupère toutes les races
   */
  async getAll(species?: string): Promise<Breed[]> {
    try {
      const url = species ? `${this.basePath}?species=${species}` : this.basePath
      const breeds = await apiClient.get<Breed[]>(url)

      logger.info('Breeds fetched successfully', { count: breeds.length, species })
      return breeds
    } catch (error) {
      logger.error('Failed to fetch breeds', { error, species })
      throw error
    }
  }

  /**
   * Récupère une race par ID
   */
  async getById(id: string): Promise<Breed> {
    try {
      const breed = await apiClient.get<Breed>(`${this.basePath}/${id}`)
      logger.info('Breed fetched', { breedId: id })
      return breed
    } catch (error) {
      logger.error('Failed to fetch breed', { error, breedId: id })
      throw error
    }
  }

  /**
   * Crée une nouvelle race
   */
  async create(data: CreateBreedDto): Promise<Breed> {
    try {
      const breed = await apiClient.post<Breed>(this.basePath, data)
      logger.info('Breed created', { breedId: breed.id, name: data.name })
      return breed
    } catch (error) {
      logger.error('Failed to create breed', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une race
   */
  async update(id: string, data: UpdateBreedDto): Promise<Breed> {
    try {
      const breed = await apiClient.put<Breed>(`${this.basePath}/${id}`, data)
      logger.info('Breed updated', { breedId: id })
      return breed
    } catch (error) {
      logger.error('Failed to update breed', { error, breedId: id, data })
      throw error
    }
  }

  /**
   * Supprime une race
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Breed deleted', { breedId: id })
    } catch (error) {
      logger.error('Failed to delete breed', { error, breedId: id })
      throw error
    }
  }
}

export const breedsService = new BreedsService()
