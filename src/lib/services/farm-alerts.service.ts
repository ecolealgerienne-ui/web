/**
 * Service API pour la gestion des alertes générées d'une ferme
 * Endpoint: /api/v1/farms/{farmId}/alerts
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  FarmAlert,
  FarmAlertsSummary,
  FarmAlertsFilterParams,
  FarmAlertsResponse,
  UpdateFarmAlertDto,
  ReadPlatform,
} from '@/lib/types/farm-alert'

class FarmAlertsService {
  /**
   * Construit le chemin de base pour une ferme
   */
  private getBasePath(farmId: string): string {
    return `/api/v1/farms/${farmId}/alerts`
  }

  /**
   * Récupère les alertes avec filtres et pagination
   */
  async getAlerts(
    farmId: string,
    params?: FarmAlertsFilterParams
  ): Promise<FarmAlertsResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status]
        queryParams.append('status', statuses.join(','))
      }
      if (params?.category) {
        const categories = Array.isArray(params.category) ? params.category : [params.category]
        queryParams.append('category', categories.join(','))
      }
      if (params?.priority) {
        const priorities = Array.isArray(params.priority) ? params.priority : [params.priority]
        queryParams.append('priority', priorities.join(','))
      }
      if (params?.animalId) queryParams.append('animalId', params.animalId)
      if (params?.lotId) queryParams.append('lotId', params.lotId)
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
      if (params?.toDate) queryParams.append('toDate', params.toDate)
      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.orderBy) queryParams.append('orderBy', params.orderBy)
      if (params?.order) queryParams.append('order', params.order)

      const url = queryParams.toString()
        ? `${this.getBasePath(farmId)}?${queryParams}`
        : this.getBasePath(farmId)

      const response = await apiClient.get<FarmAlertsResponse>(url)
      logger.info('Farm alerts fetched', { farmId, count: response.data.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alerts', { error, farmId, params })
      throw error
    }
  }

  /**
   * Récupère le résumé des alertes (pour dashboard)
   */
  async getSummary(farmId: string): Promise<FarmAlertsSummary> {
    try {
      const response = await apiClient.get<FarmAlertsSummary>(
        `${this.getBasePath(farmId)}/summary`
      )
      logger.info('Farm alerts summary fetched', { farmId, total: response.total })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alerts summary', { error, farmId })
      throw error
    }
  }

  /**
   * Récupère le compteur d'alertes non lues (pour badge header)
   * Endpoint léger pour polling fréquent
   */
  async getUnreadCount(farmId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `${this.getBasePath(farmId)}/unread-count`
      )
      return response.count
    } catch (error) {
      logger.error('Failed to fetch unread alerts count', { error, farmId })
      throw error
    }
  }

  /**
   * Récupère une alerte par son ID
   */
  async getById(farmId: string, alertId: string): Promise<FarmAlert> {
    try {
      const response = await apiClient.get<FarmAlert>(
        `${this.getBasePath(farmId)}/${alertId}`
      )
      logger.info('Farm alert fetched', { farmId, alertId })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm alert', { error, farmId, alertId })
      throw error
    }
  }

  /**
   * Met à jour le statut d'une alerte
   */
  async updateStatus(
    farmId: string,
    alertId: string,
    data: UpdateFarmAlertDto
  ): Promise<FarmAlert> {
    try {
      const response = await apiClient.patch<FarmAlert>(
        `${this.getBasePath(farmId)}/${alertId}`,
        data
      )
      logger.info('Farm alert status updated', { farmId, alertId, status: data.status })
      return response
    } catch (error) {
      logger.error('Failed to update farm alert status', { error, farmId, alertId, data })
      throw error
    }
  }

  /**
   * Marque une alerte comme lue
   */
  async markAsRead(farmId: string, alertId: string): Promise<FarmAlert> {
    return this.updateStatus(farmId, alertId, { status: 'read', readOn: 'web' })
  }

  /**
   * Ignore une alerte (dismiss)
   */
  async dismiss(farmId: string, alertId: string): Promise<FarmAlert> {
    return this.updateStatus(farmId, alertId, { status: 'dismissed', readOn: 'web' })
  }

  /**
   * Marque toutes les alertes comme lues
   */
  async markAllAsRead(farmId: string): Promise<{ updatedCount: number }> {
    try {
      const response = await apiClient.post<{ updatedCount: number }>(
        `${this.getBasePath(farmId)}/mark-all-read`,
        { readOn: 'web' as ReadPlatform }
      )
      logger.info('All farm alerts marked as read', { farmId, count: response.updatedCount })
      return response
    } catch (error) {
      logger.error('Failed to mark all farm alerts as read', { error, farmId })
      throw error
    }
  }

  /**
   * Force la génération des alertes
   */
  async generateAlerts(farmId: string): Promise<{
    generated: number
    resolved: number
    unchanged: number
  }> {
    try {
      const response = await apiClient.post<{
        generated: number
        resolved: number
        unchanged: number
      }>(`${this.getBasePath(farmId)}/generate`)
      logger.info('Farm alerts generated', { farmId, ...response })
      return response
    } catch (error) {
      logger.error('Failed to generate farm alerts', { error, farmId })
      throw error
    }
  }
}

// Export singleton
export const farmAlertsService = new FarmAlertsService()
