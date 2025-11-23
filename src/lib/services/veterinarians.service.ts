/**
 * Service API pour la gestion des vétérinaires
 */

import { apiClient } from '@/lib/api/client'
import { Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto } from '@/lib/types/veterinarian'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface VeterinarianFilters {
  search?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  emergencyService?: boolean;
}

class VeterinariansService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/veterinarians`
  }

  async getAll(filters?: Partial<VeterinarianFilters>): Promise<Veterinarian[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable))
      if (filters?.emergencyService !== undefined) params.append('emergencyService', String(filters.emergencyService))

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      logger.info('Fetching veterinarians from', { url })

      const response = await apiClient.get<any>(url)
      logger.info('Veterinarians response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      })

      // Handle both response formats: { data: [...] } or direct array [...]
      let veterinarians: Veterinarian[]
      if (Array.isArray(response)) {
        veterinarians = response
      } else if (response && typeof response === 'object' && 'data' in response) {
        veterinarians = response.data || []
      } else {
        logger.warn('Unexpected response format', { response })
        veterinarians = []
      }

      logger.info('Veterinarians fetched', { count: veterinarians.length })
      return veterinarians
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No veterinarians found (404)')
        return []
      }
      logger.error('Failed to fetch veterinarians', { error: error.message, status: error.status })
      throw error
    }
  }

  async getById(id: string): Promise<Veterinarian | null> {
    try {
      const response = await apiClient.get<{ data: Veterinarian }>(`${this.getBasePath()}/${id}`)
      logger.info('Veterinarian fetched', { id })
      return response.data
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Veterinarian not found (404)', { id })
        return null
      }
      logger.error('Failed to fetch veterinarian', { error, id })
      throw error
    }
  }

  async create(data: CreateVeterinarianDto): Promise<Veterinarian> {
    const response = await apiClient.post<{ data: Veterinarian }>(this.getBasePath(), data)
    logger.info('Veterinarian created', { id: response.data.id })
    return response.data
  }

  async update(id: string, data: UpdateVeterinarianDto): Promise<Veterinarian> {
    // Use PUT as per API specs
    const response = await apiClient.put<{ data: Veterinarian }>(`${this.getBasePath()}/${id}`, data)
    logger.info('Veterinarian updated', { id })
    return response.data
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath()}/${id}`)
      logger.info('Veterinarian deleted', { id })
    } catch (error) {
      logger.error('Failed to delete veterinarian', { error })
      throw error
    }
  }
}

export const veterinariansService = new VeterinariansService()
