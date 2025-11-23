/**
 * Service API pour la gestion des campagnes
 */

import { apiClient } from '@/lib/api/client'
import { Campaign, CreateCampaignDto, UpdateCampaignDto, CampaignProgress, CampaignType, CampaignStatus } from '@/lib/types/campaign'
import { logger } from '@/lib/utils/logger'

const TEMP_FARM_ID = 'a37a7e4c-c70d-4e7e-abc9-0eb5faaa6842'

class CampaignsService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/campaigns`
  }

  async getAll(filters?: { type?: CampaignType; status?: CampaignStatus; fromDate?: string; toDate?: string }): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.fromDate) params.append('fromDate', filters.fromDate)
      if (filters?.toDate) params.append('toDate', filters.toDate)

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      const response = await apiClient.get<{ data: Campaign[] }>(url)

      logger.info('Campaigns fetched', { count: response.data?.length || 0 })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No campaigns found (404)')
        return []
      }
      logger.error('Failed to fetch campaigns', { error })
      throw error
    }
  }

  async getActive(): Promise<Campaign[]> {
    try {
      const response = await apiClient.get<{ data: Campaign[] }>(`${this.getBasePath()}/active`)
      logger.info('Active campaigns fetched', { count: response.data?.length || 0 })
      return response.data || []
    } catch (error: any) {
      if (error.status === 404) return []
      logger.error('Failed to fetch active campaigns', { error })
      throw error
    }
  }

  async getById(id: string): Promise<Campaign> {
    try {
      const response = await apiClient.get<Campaign>(`${this.getBasePath()}/${id}`)
      logger.info('Campaign fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch campaign', { error, id })
      throw error
    }
  }

  async getProgress(id: string): Promise<CampaignProgress> {
    try {
      const response = await apiClient.get<CampaignProgress>(`${this.getBasePath()}/${id}/progress`)
      logger.info('Campaign progress fetched', { id })
      return response
    } catch (error) {
      logger.error('Failed to fetch campaign progress', { error, id })
      throw error
    }
  }

  async create(data: CreateCampaignDto): Promise<Campaign> {
    try {
      const response = await apiClient.post<Campaign>(this.getBasePath(), data)
      logger.info('Campaign created', { id: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create campaign', { error })
      throw error
    }
  }

  async update(id: string, data: UpdateCampaignDto): Promise<Campaign> {
    try {
      const response = await apiClient.put<Campaign>(`${this.getBasePath()}/${id}`, data)
      logger.info('Campaign updated', { id })
      return response
    } catch (error) {
      logger.error('Failed to update campaign', { error })
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath()}/${id}`)
      logger.info('Campaign deleted', { id })
    } catch (error) {
      logger.error('Failed to delete campaign', { error })
      throw error
    }
  }
}

export const campaignsService = new CampaignsService()
