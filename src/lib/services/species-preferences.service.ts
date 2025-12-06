/**
 * Service API pour la gestion des préférences d'espèces par ferme
 */

import { apiClient } from '@/lib/api/client'
import {
  SpeciesPreference,
  CreateSpeciesPreferenceDto,
  UpdateSpeciesPreferenceDto,
} from '@/lib/types/species-preference'
import { logger } from '@/lib/utils/logger'

class SpeciesPreferencesService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/species-preferences`
  }

  async getAll(farmId: string, includeInactive = false): Promise<SpeciesPreference[]> {
    try {
      const params = new URLSearchParams()
      params.append('includeInactive', String(includeInactive))

      const url = `${this.getBasePath(farmId)}?${params}`
      logger.info('Fetching species preferences', { farmId, url, includeInactive })

      const response = await apiClient.get<SpeciesPreference[]>(url)

      logger.info('Species preferences fetched', {
        farmId,
        count: response?.length || 0,
        hasData: !!response
      })
      return response || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No species preferences found (404)', { farmId, url: this.getBasePath(farmId) })
        return []
      }
      logger.error('Failed to fetch species preferences', { error, farmId })
      throw error
    }
  }

  async create(farmId: string, data: CreateSpeciesPreferenceDto): Promise<SpeciesPreference> {
    try {
      const response = await apiClient.post<SpeciesPreference>(this.getBasePath(farmId), data)
      logger.info('Species preference created', { farmId, preferenceId: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create species preference', { error, farmId })
      throw error
    }
  }

  async update(farmId: string, id: string, data: UpdateSpeciesPreferenceDto): Promise<SpeciesPreference> {
    try {
      const response = await apiClient.put<SpeciesPreference>(`${this.getBasePath(farmId)}/${id}`, data)
      logger.info('Species preference updated', { farmId, id })
      return response
    } catch (error) {
      logger.error('Failed to update species preference', { error, farmId, id })
      throw error
    }
  }

  async delete(farmId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath(farmId)}/${id}`)
      logger.info('Species preference deleted', { farmId, id })
    } catch (error) {
      logger.error('Failed to delete species preference', { error, farmId, id })
      throw error
    }
  }

  /**
   * Sauvegarde en batch les préférences
   */
  async saveBatch(farmId: string, speciesIds: string[]): Promise<SpeciesPreference[]> {
    try {
      const existingPreferences = await this.getAll(farmId, true)
      const existingSpeciesIds = new Set(existingPreferences.map(p => p.speciesId))
      const newSpeciesIds = new Set(speciesIds)

      // Supprimer les préférences qui ne sont plus dans la liste
      const preferencesToDelete = existingPreferences.filter(p => !newSpeciesIds.has(p.speciesId))
      for (const pref of preferencesToDelete) {
        await this.delete(farmId, pref.id)
      }

      // Créer/mettre à jour les préférences
      const allPreferences: SpeciesPreference[] = []

      for (let i = 0; i < speciesIds.length; i++) {
        const speciesId = speciesIds[i]

        if (existingSpeciesIds.has(speciesId)) {
          // L'espèce existe déjà, on la garde telle quelle
          const existingPref = existingPreferences.find(p => p.speciesId === speciesId)!
          allPreferences.push(existingPref)
        } else {
          // Nouvelle espèce - l'API n'accepte que speciesId
          const newPref = await this.create(farmId, {
            speciesId: speciesId,
          })
          allPreferences.push(newPref)
        }
      }

      return allPreferences
    } catch (error) {
      logger.error('Failed to save species preferences batch', { error, farmId })
      throw error
    }
  }
}

export const speciesPreferencesService = new SpeciesPreferencesService()
