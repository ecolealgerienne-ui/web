/**
 * Service API pour la gestion des fermes (multi-tenant)
 */

import { apiClient } from '@/lib/api/client'
import { Farm, CreateFarmDto, UpdateFarmDto } from '@/lib/types/farm'
import { logger } from '@/lib/utils/logger'

export interface FarmFilters {
  ownerId?: string;
  groupId?: string;
  isDefault?: boolean;
  search?: string;
}

class FarmsService {
  private basePath = '/api/farms'

  async getAll(filters?: Partial<FarmFilters>): Promise<Farm[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.ownerId) params.append('ownerId', filters.ownerId)
      if (filters?.groupId) params.append('groupId', filters.groupId)
      if (filters?.isDefault !== undefined) params.append('isDefault', String(filters.isDefault))
      if (filters?.search) params.append('search', filters.search)

      const url = params.toString() ? `${this.basePath}?${params}` : this.basePath
      logger.info('Fetching farms from', { url })

      const response = await apiClient.get<any>(url)
      logger.info('Farms response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      })

      // Handle both response formats: { data: [...] } or direct array [...]
      let farms: Farm[]
      if (Array.isArray(response)) {
        farms = response
      } else if (response && typeof response === 'object' && 'data' in response) {
        farms = response.data || []
      } else {
        logger.warn('Unexpected response format', { response })
        farms = []
      }

      logger.info('Farms fetched', { count: farms.length })
      return farms
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No farms found (404)')
        return []
      }
      logger.error('Failed to fetch farms', { error: error.message, status: error.status })
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
    logger.info('Creating farm', { data })
    const response = await apiClient.post<{ data: Farm }>(this.basePath, data)
    logger.info('Farm created', { id: response.data?.id || response })
    return response.data || response
  }

  async update(id: string, data: UpdateFarmDto): Promise<Farm> {
    logger.info('Updating farm', { id, data })
    const response = await apiClient.put<{ data: Farm }>(`${this.basePath}/${id}`, data)
    logger.info('Farm updated', { id })
    return response.data || response
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
