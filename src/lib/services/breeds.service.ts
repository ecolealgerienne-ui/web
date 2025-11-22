/**
 * Service API pour la gestion des races (READ ONLY)
 *
 * Les races sont des données de référence statiques fournies par le backend.
 * Pas de création/modification/suppression possible via l'API.
 */

import { apiClient } from '@/lib/api/client'
import { Breed } from '@/lib/types/breed'
import { logger } from '@/lib/utils/logger'

class BreedsService {
  private basePath = '/api/v1/breeds'

  /**
   * Récupère toutes les races
   * @param speciesId - Optionnel: filtrer par espèce (ex: 'sheep', 'goat', 'cattle')
   */
  async getAll(speciesId?: string): Promise<Breed[]> {
    try {
      const url = speciesId ? `${this.basePath}?speciesId=${speciesId}` : this.basePath
      const breeds = await apiClient.get<Breed[]>(url)

      logger.info('Breeds fetched successfully', { count: breeds.length, speciesId })
      return breeds
    } catch (error) {
      logger.error('Failed to fetch breeds', { error, speciesId })
      throw error
    }
  }
}

export const breedsService = new BreedsService()
