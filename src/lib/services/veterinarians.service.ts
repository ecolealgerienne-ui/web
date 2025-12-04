/**
 * Service API pour la gestion des vétérinaires
 */

import { apiClient } from '@/lib/api/client'
import { Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto } from '@/lib/types/veterinarian'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config';


export interface VeterinarianFilters {
  search?: string
  scope?: 'global' | 'local' | 'all'
  department?: string
  isActive?: boolean
  isAvailable?: boolean
  emergencyService?: boolean
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

class VeterinariansService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/veterinarians`
  }

  async getAll(farmId: string, filters?: VeterinarianFilters): Promise<Veterinarian[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.scope) params.append('scope', filters.scope)
      if (filters?.department) params.append('department', filters.department)
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable))
      if (filters?.emergencyService !== undefined) params.append('emergencyService', String(filters.emergencyService))
      if (filters?.page !== undefined) params.append('page', String(filters.page))
      if (filters?.limit !== undefined) params.append('limit', String(filters.limit))
      if (filters?.sort) params.append('sort', filters.sort)
      if (filters?.order) params.append('order', filters.order)

      const url = params.toString() ? `${this.getBasePath(farmId)}?${params}` : this.getBasePath(farmId)
      logger.info('Fetching veterinarians', { url, farmId, filters })

      const response = await apiClient.get<{ data: Veterinarian[] }>(url)

      logger.info('Veterinarians fetched', {
        farmId,
        count: response.data?.length || 0,
        hasData: !!response.data,
        url
      })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No veterinarians found (404)', { farmId, basePath: this.getBasePath(farmId) })
        return []
      }
      logger.error('Failed to fetch veterinarians', { error, farmId, basePath: this.getBasePath(farmId) })
      throw error
    }
  }

  async getById(farmId: string, id: string): Promise<Veterinarian | null> {
    try {
      const response = await apiClient.get<{ data: Veterinarian }>(`${this.getBasePath(farmId)}/${id}`)
      return response.data || null
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      logger.error('Failed to fetch veterinarian', { farmId, id, error })
      throw error
    }
  }

  async create(farmId: string, data: CreateVeterinarianDto): Promise<Veterinarian> {
    try {
      const response = await apiClient.post<Veterinarian>(this.getBasePath(farmId), data)
      logger.info('Veterinarian created', { farmId, id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create veterinarian', { farmId, error })
      throw error
    }
  }

  async update(farmId: string, id: string, data: UpdateVeterinarianDto): Promise<Veterinarian> {
    try {
      const response = await apiClient.put<Veterinarian>(`${this.getBasePath(farmId)}/${id}`, data)
      logger.info('Veterinarian updated', { farmId, id })
      return response
    } catch (error) {
      logger.error('Failed to update veterinarian', { farmId, error })
      throw error
    }
  }

  async delete(farmId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath(farmId)}/${id}`)
      logger.info('Veterinarian deleted', { farmId, id })
    } catch (error) {
      logger.error('Failed to delete veterinarian', { farmId, error })
      throw error
    }
  }
}

export const veterinariansService = new VeterinariansService()
