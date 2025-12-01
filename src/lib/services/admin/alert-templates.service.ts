/**
 * Alert Templates Service
 *
 * Service for managing alert template operations (CRUD)
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type {
  AlertTemplate,
  CreateAlertTemplateDto,
  UpdateAlertTemplateDto,
  AlertTemplateFilterParams,
} from '@/lib/types/admin/alert-template'
import type {
  PaginatedResponse,
  CrudService,
} from '@/lib/types/common/api'

/**
 * Alert Templates Service
 * Implements CRUD operations for alert templates
 */
class AlertTemplatesService
  implements
    CrudService<AlertTemplate, CreateAlertTemplateDto, UpdateAlertTemplateDto>
{
  private readonly baseUrl = '/api/v1/alert-templates'

  /**
   * Get all alert templates with optional filtering and pagination
   */
  async getAll(
    params?: AlertTemplateFilterParams
  ): Promise<PaginatedResponse<AlertTemplate>> {
    try {
      const queryParams = new URLSearchParams()

      if (params?.page) queryParams.append('page', String(params.page))
      if (params?.limit) queryParams.append('limit', String(params.limit))
      if (params?.search) queryParams.append('search', params.search)
      if (params?.category) queryParams.append('category', params.category)
      if (params?.priority) queryParams.append('priority', params.priority)
      if (params?.isActive !== undefined)
        queryParams.append('isActive', String(params.isActive))
      if (params?.orderBy) queryParams.append('orderBy', params.orderBy)
      if (params?.order) queryParams.append('order', params.order)

      const url = queryParams.toString()
        ? `${this.baseUrl}?${queryParams}`
        : this.baseUrl

      const response =
        await apiClient.get<PaginatedResponse<AlertTemplate>>(url)
      logger.info('Alert templates fetched', { count: response.data.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch alert templates', { error, params })
      throw error
    }
  }

  /**
   * Get a single alert template by ID
   */
  async getById(id: string): Promise<AlertTemplate> {
    try {
      const response = await apiClient.get<AlertTemplate>(
        `${this.baseUrl}/${id}`
      )
      logger.info('Alert template fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch alert template', { error, id })
      throw error
    }
  }

  /**
   * Create a new alert template
   */
  async create(data: CreateAlertTemplateDto): Promise<AlertTemplate> {
    try {
      const response = await apiClient.post<AlertTemplate>(this.baseUrl, data)
      logger.info('Alert template created', { id: response.id, code: data.code })
      return response
    } catch (error) {
      logger.error('Failed to create alert template', { error, data })
      throw error
    }
  }

  /**
   * Update an existing alert template
   */
  async update(
    id: string,
    data: UpdateAlertTemplateDto
  ): Promise<AlertTemplate> {
    try {
      const response = await apiClient.patch<AlertTemplate>(
        `${this.baseUrl}/${id}`,
        data
      )
      logger.info('Alert template updated', { id, version: data.version })
      return response
    } catch (error) {
      logger.error('Failed to update alert template', { error, id, data })
      throw error
    }
  }

  /**
   * Delete an alert template (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`)
      logger.info('Alert template deleted', { id })
    } catch (error) {
      logger.error('Failed to delete alert template', { error, id })
      throw error
    }
  }
}

// Export singleton instance
export const alertTemplatesService = new AlertTemplatesService()
