/**
 * Service API pour la gestion des configurations d'alertes
 */

import { apiClient } from '@/lib/api/client'
import { AlertConfiguration, CreateAlertConfigurationDto, UpdateAlertConfigurationDto, AlertType } from '@/lib/types/alert-configuration'
import { logger } from '@/lib/utils/logger'

const TEMP_FARM_ID = 'a37a7e4c-c70d-4e7e-abc9-0eb5faaa6842'

class AlertConfigurationsService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/alert-configurations`
  }

  async getAll(filters?: { type?: AlertType; category?: string; enabled?: boolean }): Promise<AlertConfiguration[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.enabled !== undefined) params.append('enabled', String(filters.enabled))

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      const response = await apiClient.get<{ data: AlertConfiguration[] }>(url)

      logger.info('Alert configurations fetched', { count: response.data?.length || 0 })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No alert configurations found (404)')
        return []
      }
      logger.error('Failed to fetch alert configurations', { error })
      throw error
    }
  }

  async getById(id: string): Promise<AlertConfiguration> {
    try {
      const response = await apiClient.get<AlertConfiguration>(`${this.getBasePath()}/${id}`)
      logger.info('Alert configuration fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch alert configuration', { error, id })
      throw error
    }
  }

  async create(data: CreateAlertConfigurationDto): Promise<AlertConfiguration> {
    try {
      const response = await apiClient.post<AlertConfiguration>(this.getBasePath(), data)
      logger.info('Alert configuration created', { id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create alert configuration', { error })
      throw error
    }
  }

  async update(id: string, data: UpdateAlertConfigurationDto): Promise<AlertConfiguration> {
    try {
      const response = await apiClient.put<AlertConfiguration>(`${this.getBasePath()}/${id}`, data)
      logger.info('Alert configuration updated', { id })
      return response
    } catch (error) {
      logger.error('Failed to update alert configuration', { error })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath()}/${id}`)
      logger.info('Alert configuration deleted', { id })
    } catch (error) {
      logger.error('Failed to delete alert configuration', { error })
      throw error
    }
  }
}

export const alertConfigurationsService = new AlertConfigurationsService()
