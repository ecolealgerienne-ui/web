/**
 * Service API pour la gestion des vétérinaires
 */

import { apiClient } from '@/lib/api/client'
import { Veterinarian, CreateVeterinarianDto, UpdateVeterinarianDto } from '@/lib/types/veterinarian'
import { logger } from '@/lib/utils/logger'

const TEMP_FARM_ID = 'd3934abb-13d2-4950-8d1c-f8ab4628e762'

class VeterinariansService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/veterinarians`
  }

  async getAll(filters?: { isActive?: boolean; search?: string }): Promise<Veterinarian[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
      if (filters?.search) params.append('search', filters.search)

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      const response = await apiClient.get<{ data: Veterinarian[] }>(url)

      logger.info('Veterinarians fetched', { count: response.data?.length || 0 })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No veterinarians found (404)')
        return []
      }
      logger.error('Failed to fetch veterinarians', { error })
      throw error
    }
  }

  async create(data: CreateVeterinarianDto): Promise<Veterinarian> {
    try {
      const response = await apiClient.post<Veterinarian>(this.getBasePath(), data)
      logger.info('Veterinarian created', { id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create veterinarian', { error })
      throw error
    }
  }

  async update(id: string, data: UpdateVeterinarianDto): Promise<Veterinarian> {
    try {
      const response = await apiClient.put<Veterinarian>(`${this.getBasePath()}/${id}`, data)
      logger.info('Veterinarian updated', { id })
      return response
    } catch (error) {
      logger.error('Failed to update veterinarian', { error })
      throw error
    }
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
