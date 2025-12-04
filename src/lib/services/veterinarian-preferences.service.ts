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

      const response = await apiClient.get<VeterinarianPreferenceResponse>(url)

      logger.info('Veterinarian preferences fetched', {
        farmId,
        count: response.data?.length || 0,
        hasData: !!response.data,
        success: response.success
      })
      return response.data || []
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
   * Crée de nouvelles préférences pour les IDs qui n'existaient pas
   */
  async saveBatch(farmId: string, veterinarianIds: string[]): Promise<VeterinarianPreference[]> {
    try {
      // Pour l'instant, on crée une par une
      // TODO: Implémenter un endpoint batch côté backend
      const preferences: VeterinarianPreference[] = []

      for (let i = 0; i < veterinarianIds.length; i++) {
        const pref = await this.create(farmId, {
          veterinarianId: veterinarianIds[i],
          displayOrder: i + 1,
          isActive: true,
        })
        preferences.push(pref)
      }

      return preferences
    } catch (error) {
      logger.error('Failed to save veterinarian preferences batch', { error, farmId })
      throw error
    }
  }
}

export const veterinarianPreferencesService = new VeterinarianPreferencesService()
