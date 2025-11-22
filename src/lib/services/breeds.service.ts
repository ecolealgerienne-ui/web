/**
 * Service API pour la gestion des races (CRUD Admin)
 *
 * Les races sont des données de référence administrées.
 * CRUD complet disponible pour les super admins.
 */

import { apiClient } from '@/lib/api/client'
import { Breed, CreateBreedDto, UpdateBreedDto } from '@/lib/types/breed'
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

  /**
   * Crée une nouvelle race (Admin)
   */
  async create(data: CreateBreedDto): Promise<Breed> {
    try {
      // Convertir en snake_case pour le backend
      const payload = {
        id: data.id,
        species_id: data.speciesId,
        name_fr: data.nameFr,
        name_en: data.nameEn,
        name_ar: data.nameAr,
        description: data.description,
        display_order: data.displayOrder,
        is_active: data.isActive ?? true,
      }

      const response = await apiClient.post<any>(this.basePath, payload)

      // Extraire et mapper la réponse
      let rawBreed: any = response
      if (response?.data) {
        rawBreed = response.data
      }

      const breed: Breed = {
        id: rawBreed.id,
        name: rawBreed.name_fr || rawBreed.nameFr || rawBreed.name || '',
        nameFr: rawBreed.name_fr || rawBreed.nameFr || '',
        nameEn: rawBreed.name_en || rawBreed.nameEn || '',
        nameAr: rawBreed.name_ar || rawBreed.nameAr || '',
        speciesId: rawBreed.species_id || rawBreed.speciesId || '',
        description: rawBreed.description,
        displayOrder: rawBreed.display_order || rawBreed.displayOrder,
        isActive: rawBreed.is_active ?? rawBreed.isActive ?? true,
      }

      logger.info('Breed created successfully', { id: breed.id })
      return breed
    } catch (error) {
      logger.error('Failed to create breed', { error, data })
      throw error
    }
  }

  /**
   * Met à jour une race existante (Admin)
   */
  async update(id: string, data: UpdateBreedDto): Promise<Breed> {
    try {
      // Convertir en snake_case pour le backend
      const payload: any = {}
      if (data.speciesId !== undefined) payload.species_id = data.speciesId
      if (data.nameFr !== undefined) payload.name_fr = data.nameFr
      if (data.nameEn !== undefined) payload.name_en = data.nameEn
      if (data.nameAr !== undefined) payload.name_ar = data.nameAr
      if (data.description !== undefined) payload.description = data.description
      if (data.displayOrder !== undefined) payload.display_order = data.displayOrder
      if (data.isActive !== undefined) payload.is_active = data.isActive

      const response = await apiClient.put<any>(`${this.basePath}/${id}`, payload)

      // Extraire et mapper la réponse
      let rawBreed: any = response
      if (response?.data) {
        rawBreed = response.data
      }

      const breed: Breed = {
        id: rawBreed.id,
        name: rawBreed.name_fr || rawBreed.nameFr || rawBreed.name || '',
        nameFr: rawBreed.name_fr || rawBreed.nameFr || '',
        nameEn: rawBreed.name_en || rawBreed.nameEn || '',
        nameAr: rawBreed.name_ar || rawBreed.nameAr || '',
        speciesId: rawBreed.species_id || rawBreed.speciesId || '',
        description: rawBreed.description,
        displayOrder: rawBreed.display_order || rawBreed.displayOrder,
        isActive: rawBreed.is_active ?? rawBreed.isActive ?? true,
      }

      logger.info('Breed updated successfully', { id })
      return breed
    } catch (error) {
      logger.error('Failed to update breed', { error, id, data })
      throw error
    }
  }

  /**
   * Supprime une race (soft delete - Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Breed deleted successfully', { id })
    } catch (error) {
      logger.error('Failed to delete breed', { error, id })
      throw error
    }
  }
}

export const breedsService = new BreedsService()
