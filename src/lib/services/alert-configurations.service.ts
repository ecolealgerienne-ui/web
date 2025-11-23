/**
 * Service API pour la gestion des configurations d'alertes
 */

import { apiClient } from '@/lib/api/client'
import { AlertConfiguration, CreateAlertConfigurationDto, UpdateAlertConfigurationDto, AlertType } from '@/lib/types/alert-configuration'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface AlertConfigurationFilters {
  type?: AlertType;
  category?: string;
  enabled?: boolean;
}

class AlertConfigurationsService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/alert-configurations`
  }

  async getAll(filters?: Partial<AlertConfigurationFilters>): Promise<AlertConfiguration[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.enabled !== undefined) params.append('enabled', String(filters.enabled))

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      logger.info('Fetching alert configurations from', { url })

      const response = await apiClient.get<any>(url)
      logger.info('Alert configurations response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      })

      // Handle both response formats: { data: [...] } or direct array [...]
      let alertConfigurations: AlertConfiguration[]
      if (Array.isArray(response)) {
        alertConfigurations = response
      } else if (response && typeof response === 'object' && 'data' in response) {
        alertConfigurations = response.data || []
      } else {
        logger.warn('Unexpected response format', { response })
        alertConfigurations = []
      }

      logger.info('Alert configurations fetched', { count: alertConfigurations.length })
      return alertConfigurations
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No alert configurations found (404)')
        return []
      }
      logger.error('Failed to fetch alert configurations', { error: error.message, status: error.status })
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
    logger.info('Creating alert configuration', { data })
    const response = await apiClient.post<{ data: AlertConfiguration }>(this.getBasePath(), data)
    logger.info('Alert configuration created', { id: response.data?.id || response })
    return response.data || response
  }

  async update(id: string, data: UpdateAlertConfigurationDto): Promise<AlertConfiguration> {
    logger.info('Updating alert configuration', { id, data })
    const response = await apiClient.put<{ data: AlertConfiguration }>(`${this.getBasePath()}/${id}`, data)
    logger.info('Alert configuration updated', { id })
    return response.data || response
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
