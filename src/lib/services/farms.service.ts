/**
 * Service API pour la gestion des fermes (multi-tenant)
 */

import { apiClient } from '@/lib/api/client'
import { Farm, CreateFarmDto, UpdateFarmDto } from '@/lib/types/farm'
import { logger } from '@/lib/utils/logger'

class FarmsService {
  private basePath = '/api/farms'

  async getAll(filters?: { ownerId?: string; groupId?: string; isDefault?: boolean; search?: string }): Promise<Farm[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.ownerId) params.append('ownerId', filters.ownerId)
      if (filters?.groupId) params.append('groupId', filters.groupId)
      if (filters?.isDefault !== undefined) params.append('isDefault', String(filters.isDefault))
      if (filters?.search) params.append('search', filters.search)

      const url = params.toString() ? `${this.basePath}?${params}` : this.basePath
      const response = await apiClient.get<{ data: Farm[] }>(url)

      logger.info('Farms fetched', { count: response.data?.length || 0 })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No farms found (404)')
        return []
      }
      logger.error('Failed to fetch farms', { error })
      throw error
    }
  }

  async getById(id: string, includeStats?: boolean): Promise<Farm> {
    try {
      const url = includeStats ? `${this.basePath}/${id}?includeStats=true` : `${this.basePath}/${id}`
      const response = await apiClient.get<Farm>(url)
      logger.info('Farm fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch farm', { error, id })
      throw error
    }
  }

  async create(data: CreateFarmDto): Promise<Farm> {
    try {
      const response = await apiClient.post<Farm>(this.basePath, data)
      logger.info('Farm created', { id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create farm', { error })
      throw error
    }
  }

  async update(id: string, data: UpdateFarmDto): Promise<Farm> {
    try {
      const response = await apiClient.put<Farm>(`${this.basePath}/${id}`, data)
      logger.info('Farm updated', { id })
      return response
    } catch (error) {
      logger.error('Failed to update farm', { error })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      logger.info('Farm deleted', { id })
    } catch (error) {
      logger.error('Failed to delete farm', { error })
      throw error
    }
  }
}

export const farmsService = new FarmsService()
