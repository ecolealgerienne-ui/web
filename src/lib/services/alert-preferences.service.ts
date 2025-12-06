/**
 * Service API pour la gestion des préférences d'alertes d'une ferme
 * Endpoint: /api/v1/farms/{farmId}/alert-template-preferences
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  AlertPreference,
  CreateAlertPreferenceDto,
} from '@/lib/types/alert-preference'
import type { PaginatedResponse } from '@/lib/types/common/api'

class AlertPreferencesService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/alert-template-preferences`
  }

  /**
   * Récupère toutes les préférences d'alertes d'une ferme
   */
  async getAll(farmId: string): Promise<AlertPreference[]> {
    try {
      logger.info('Fetching alert preferences', { farmId })

      const response = await apiClient.get<PaginatedResponse<AlertPreference>>(
        `${this.getBasePath(farmId)}?page=1&limit=100&order=asc`
      )

      logger.info('Alert preferences fetched', { farmId, count: response.data.length })
      return response.data
    } catch (error: unknown) {
      const apiError = error as { status?: number }
      if (apiError.status === 404) {
        logger.info('No alert preferences found (404)', { farmId })
        return []
      }
      logger.error('Failed to fetch alert preferences', { error, farmId })
      throw error
    }
  }

  /**
   * Crée une nouvelle préférence d'alerte
   */
  async create(farmId: string, data: CreateAlertPreferenceDto): Promise<AlertPreference> {
    try {
      logger.info('Creating alert preference', { farmId, alertTemplateId: data.alertTemplateId })

      const response = await apiClient.post<AlertPreference>(
        this.getBasePath(farmId),
        data
      )

      logger.info('Alert preference created', { farmId, id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create alert preference', { error, farmId, data })
      throw error
    }
  }

  /**
   * Supprime une préférence d'alerte
   */
  async delete(farmId: string, preferenceId: string): Promise<void> {
    try {
      logger.info('Deleting alert preference', { farmId, preferenceId })

      await apiClient.delete(`${this.getBasePath(farmId)}/${preferenceId}`)

      logger.info('Alert preference deleted', { farmId, preferenceId })
    } catch (error) {
      logger.error('Failed to delete alert preference', { error, farmId, preferenceId })
      throw error
    }
  }

  /**
   * Sauvegarde en batch les préférences (supprime les anciennes et crée les nouvelles)
   */
  async saveBatch(farmId: string, alertTemplateIds: string[]): Promise<void> {
    try {
      logger.info('Saving alert preferences batch', { farmId, count: alertTemplateIds.length })

      // Récupérer les préférences actuelles
      const currentPrefs = await this.getAll(farmId)
      const currentIds = currentPrefs.map(p => p.alertTemplateId)

      // Trouver les IDs à ajouter et à supprimer
      const toAdd = alertTemplateIds.filter(id => !currentIds.includes(id))
      const toRemove = currentPrefs.filter(p => !alertTemplateIds.includes(p.alertTemplateId))

      // Supprimer les anciennes
      for (const pref of toRemove) {
        await this.delete(farmId, pref.id)
      }

      // Ajouter les nouvelles
      for (const alertTemplateId of toAdd) {
        await this.create(farmId, { alertTemplateId })
      }

      logger.info('Alert preferences batch saved', { farmId, added: toAdd.length, removed: toRemove.length })
    } catch (error) {
      logger.error('Failed to save alert preferences batch', { error, farmId })
      throw error
    }
  }
}

export const alertPreferencesService = new AlertPreferencesService()
