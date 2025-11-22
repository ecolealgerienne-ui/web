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
      const response = await apiClient.get<any>(url)

      // Le backend retourne une structure emboîtée avec des champs en snake_case
      let rawBreeds: any[] = []

      // Extraire le tableau de breeds (peut être doublement emboîté)
      if (Array.isArray(response)) {
        rawBreeds = response
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        // Double emboîtement: {success, data: {success, data: [...]}}
        rawBreeds = response.data.data
      } else if (response?.data && Array.isArray(response.data)) {
        rawBreeds = response.data
      }

      // Mapper les champs snake_case vers camelCase
      const breeds: Breed[] = rawBreeds.map((breed: any) => ({
        id: breed.id,
        name: breed.name_fr || breed.nameFr || breed.name || '',
        nameFr: breed.name_fr || breed.nameFr || '',
        nameEn: breed.name_en || breed.nameEn || '',
        nameAr: breed.name_ar || breed.nameAr || '',
        speciesId: breed.species_id || breed.speciesId || '',
        description: breed.description,
      }))

      logger.info('Breeds fetched successfully', { count: breeds.length, speciesId })
      return breeds
    } catch (error) {
      logger.error('Failed to fetch breeds', { error, speciesId })
      throw error
    }
  }
}

export const breedsService = new BreedsService()
