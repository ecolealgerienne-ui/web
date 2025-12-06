/**
 * Service API pour la gestion des préférences de races par ferme
 */

import { apiClient } from '@/lib/api/client'
import {
  BreedPreference,
  CreateBreedPreferenceDto,
} from '@/lib/types/breed-preference'
import { logger } from '@/lib/utils/logger'

class BreedPreferencesService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/breed-preferences`
  }

  async getAll(farmId: string, includeInactive = false): Promise<BreedPreference[]> {
    try {
      const params = new URLSearchParams()
      params.append('includeInactive', String(includeInactive))

      const url = `${this.getBasePath(farmId)}?${params}`
      logger.info('Fetching breed preferences', { farmId, url, includeInactive })

      const response = await apiClient.get<BreedPreference[]>(url)

      logger.info('Breed preferences fetched', {
        farmId,
        count: response?.length || 0,
        hasData: !!response
      })
      return response || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No breed preferences found (404)', { farmId, url: this.getBasePath(farmId) })
        return []
      }
      logger.error('Failed to fetch breed preferences', { error, farmId })
      throw error
    }
  }

  async create(farmId: string, data: CreateBreedPreferenceDto): Promise<BreedPreference> {
    try {
      const response = await apiClient.post<BreedPreference>(this.getBasePath(farmId), data)
      logger.info('Breed preference created', { farmId, preferenceId: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create breed preference', { error, farmId })
      throw error
    }
  }

  async delete(farmId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath(farmId)}/${id}`)
      logger.info('Breed preference deleted', { farmId, id })
    } catch (error) {
      logger.error('Failed to delete breed preference', { error, farmId, id })
      throw error
    }
  }

  /**
   * Sauvegarde en batch les préférences
   */
  async saveBatch(farmId: string, breedIds: string[]): Promise<BreedPreference[]> {
    try {
      const existingPreferences = await this.getAll(farmId, true)
      const existingBreedIds = new Set(existingPreferences.map(p => p.breedId))
      const newBreedIds = new Set(breedIds)

      // Supprimer les préférences qui ne sont plus dans la liste
      const preferencesToDelete = existingPreferences.filter(p => !newBreedIds.has(p.breedId))
      for (const pref of preferencesToDelete) {
        await this.delete(farmId, pref.id)
      }

      // Créer les nouvelles préférences
      const allPreferences: BreedPreference[] = []

      for (const breedId of breedIds) {
        if (existingBreedIds.has(breedId)) {
          // La race existe déjà, on la garde telle quelle
          const existingPref = existingPreferences.find(p => p.breedId === breedId)!
          allPreferences.push(existingPref)
        } else {
          // Nouvelle race - l'API n'accepte que breedId
          const newPref = await this.create(farmId, {
            breedId: breedId,
          })
          allPreferences.push(newPref)
        }
      }

      return allPreferences
    } catch (error) {
      logger.error('Failed to save breed preferences batch', { error, farmId })
      throw error
    }
  }
}

export const breedPreferencesService = new BreedPreferencesService()
