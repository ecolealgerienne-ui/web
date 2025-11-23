/**
 * Service API pour la gestion des campagnes
 */

import { apiClient } from '@/lib/api/client'
import { Campaign, CreateCampaignDto, UpdateCampaignDto, CampaignProgress, CampaignType, CampaignStatus } from '@/lib/types/campaign'
import { logger } from '@/lib/utils/logger'
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface CampaignFilters {
  type?: CampaignType;
  status?: CampaignStatus;
  fromDate?: string;
  toDate?: string;
}

class CampaignsService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/campaigns`
  }

  async getAll(filters?: Partial<CampaignFilters>): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.append('type', filters.type)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.fromDate) params.append('fromDate', filters.fromDate)
      if (filters?.toDate) params.append('toDate', filters.toDate)

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath()
      logger.info('Fetching campaigns from', { url })

      const response = await apiClient.get<any>(url)
      logger.info('Campaigns response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      })

      // Handle both response formats: { data: [...] } or direct array [...]
      let campaigns: Campaign[]
      if (Array.isArray(response)) {
        campaigns = response
      } else if (response && typeof response === 'object' && 'data' in response) {
        campaigns = response.data || []
      } else {
        logger.warn('Unexpected response format', { response })
        campaigns = []
      }

      logger.info('Campaigns fetched', { count: campaigns.length })
      return campaigns
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No campaigns found (404)')
        return []
      }
      logger.error('Failed to fetch campaigns', { error: error.message, status: error.status })
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
    logger.info('Creating campaign', { data })
    const response = await apiClient.post<{ data: Campaign }>(this.getBasePath(), data)
    logger.info('Campaign created', { id: response.data?.id || response })
    return response.data || response
  }

  async update(id: string, data: UpdateCampaignDto): Promise<Campaign> {
    logger.info('Updating campaign', { id, data })
    const response = await apiClient.put<{ data: Campaign }>(`${this.getBasePath()}/${id}`, data)
    logger.info('Campaign updated', { id })
    return response.data || response
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
