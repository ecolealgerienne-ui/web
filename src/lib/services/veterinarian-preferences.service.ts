/**
 * Service API pour la gestion des préférences de vétérinaires par ferme
 */

import { apiClient } from '@/lib/api/client'
import {
  VeterinarianPreference,
  VeterinarianPreferenceResponse,
  CreateVeterinarianPreferenceDto,
  UpdateVeterinarianPreferenceDto,
} from '@/lib/types/veterinarian-preference'
import { logger } from '@/lib/utils/logger'

class VeterinarianPreferencesService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/veterinarian-preferences`
  }

  async getAll(farmId: string, includeInactive = false): Promise<VeterinarianPreference[]> {
    try {
      const params = new URLSearchParams()
      params.append('includeInactive', String(includeInactive))

      const url = `${this.getBasePath(farmId)}?${params}`
      logger.info('Fetching veterinarian preferences', { farmId, url, includeInactive })

      // apiClient déballe automatiquement { success, data } et retourne data directement
      const response = await apiClient.get<VeterinarianPreference[]>(url)

      logger.info('Veterinarian preferences fetched', {
        farmId,
        count: response?.length || 0,
        hasData: !!response
      })
      return response || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No veterinarian preferences found (404)', { farmId, url: this.getBasePath(farmId) })
        return []
      }
      logger.error('Failed to fetch veterinarian preferences', { error, farmId })
      throw error
    }
  }

  async create(farmId: string, data: CreateVeterinarianPreferenceDto): Promise<VeterinarianPreference> {
    try {
      const response = await apiClient.post<VeterinarianPreference>(this.getBasePath(farmId), data)
      logger.info('Veterinarian preference created', { farmId, preferenceId: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create veterinarian preference', { error, farmId })
      throw error
    }
  }

  async update(farmId: string, id: string, data: UpdateVeterinarianPreferenceDto): Promise<VeterinarianPreference> {
    try {
      const response = await apiClient.put<VeterinarianPreference>(`${this.getBasePath(farmId)}/${id}`, data)
      logger.info('Veterinarian preference updated', { farmId, id })
      return response
    } catch (error) {
      logger.error('Failed to update veterinarian preference', { error, farmId, id })
      throw error
    }
  }

  async delete(farmId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath(farmId)}/${id}`)
      logger.info('Veterinarian preference deleted', { farmId, id })
    } catch (error) {
      logger.error('Failed to delete veterinarian preference', { error, farmId, id })
      throw error
    }
  }

  /**
   * Sauvegarde en batch les préférences
   * - Supprime les préférences qui ne sont plus dans la liste
   * - Crée les nouvelles préférences
   * - Met à jour l'ordre de toutes les préférences
   */
  async saveBatch(farmId: string, veterinarianIds: string[]): Promise<VeterinarianPreference[]> {
    try {
      // 1. Récupérer les préférences existantes
      const existingPreferences = await this.getAll(farmId, true)
      const existingVetIds = new Set(existingPreferences.map(p => p.veterinarianId))
      const newVetIds = new Set(veterinarianIds)

      // 2. Supprimer les préférences qui ne sont plus dans la liste
      const preferencesToDelete = existingPreferences.filter(p => !newVetIds.has(p.veterinarianId))
      for (const pref of preferencesToDelete) {
        await this.delete(farmId, pref.id)
      }

      // 3. Créer les nouvelles préférences et collecter toutes les préférences
      const allPreferences: VeterinarianPreference[] = []

      for (let i = 0; i < veterinarianIds.length; i++) {
        const vetId = veterinarianIds[i]

        if (existingVetIds.has(vetId)) {
          // Préférence existe déjà, la mettre à jour avec le nouveau displayOrder
          const existingPref = existingPreferences.find(p => p.veterinarianId === vetId)!
          const updatedPref = await this.update(farmId, existingPref.id, {
            displayOrder: i + 1,
            isActive: true,
          })
          allPreferences.push(updatedPref)
        } else {
          // Nouvelle préférence, la créer
          const newPref = await this.create(farmId, {
            veterinarianId: vetId,
            displayOrder: i + 1,
            isActive: true,
          })
          allPreferences.push(newPref)
        }
      }

      return allPreferences
    } catch (error) {
      logger.error('Failed to save veterinarian preferences batch', { error, farmId })
      throw error
    }
  }
}

export const veterinarianPreferencesService = new VeterinarianPreferencesService()
