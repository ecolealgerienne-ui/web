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

      // API returns { data: [...], meta: { total, page, limit, pages } }
      // We need to map 'pages' to 'totalPages' for frontend consistency
      const response = await apiClient.get<{
        data: FarmAlert[]
        meta: { total: number; page: number; limit: number; pages: number }
      }>(url)

      logger.info('Farm alerts fetched', { farmId, count: response.data?.length || 0 })

      return {
        data: response.data || [],
        meta: {
          total: response.meta?.total ?? 0,
          page: response.meta?.page ?? 1,
          limit: response.meta?.limit ?? 20,
          totalPages: response.meta?.pages ?? 0,
        },
      }
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err.status === 404) {
        logger.info('No alerts found (404)', { farmId })
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
      }
      logger.error('Failed to fetch farm alerts', { error, farmId, params })
      throw error
    }
  }

  /**
   * Récupère le résumé des alertes (pour dashboard)
   */
  async getSummary(farmId: string): Promise<FarmAlertsSummary> {
    const defaultSummary: FarmAlertsSummary = {
      total: 0,
      unread: 0,
      byStatus: { pending: 0, read: 0, dismissed: 0, resolved: 0 },
      byPriority: { urgent: 0, high: 0, medium: 0, low: 0 },
      byCategory: {
        health: 0,
        vaccination: 0,
        treatment: 0,
        reproduction: 0,
        nutrition: 0,
        administrative: 0,
        other: 0,
      },
    }

    try {
      const response = await apiClient.get<FarmAlertsSummary>(
        `${this.getBasePath(farmId)}/summary`
      )

      // Si la réponse est vide ou incomplète, retourner les valeurs par défaut
      if (!response || typeof response.total !== 'number') {
        logger.info('Empty summary response, returning defaults', { farmId })
        return defaultSummary
      }

      logger.info('Farm alerts summary fetched', { farmId, total: response.total })
      return response
    } catch (error: unknown) {
      const err = error as { status?: number }
      // En cas de 404, retourner un summary vide
      if (err.status === 404) {
        logger.info('No alerts summary found (404), returning defaults', { farmId })
        return defaultSummary
      }
      logger.error('Failed to fetch farm alerts summary', { error, farmId })
      // En cas d'autre erreur, retourner aussi les valeurs par défaut pour ne pas bloquer le dashboard
      return defaultSummary
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
      return response.count ?? 0
    } catch (error: unknown) {
      const err = error as { status?: number }
      // En cas de 404, retourner 0
      if (err.status === 404) {
        return 0
      }
      logger.error('Failed to fetch unread alerts count', { error, farmId })
      // Retourner 0 en cas d'erreur pour ne pas bloquer l'UI
      return 0
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
