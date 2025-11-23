/**
 * Hook React pour la gestion des campagnes
 */

import { useState, useEffect, useCallback } from 'react'
import { Campaign } from '@/lib/types/campaign'
import { campaignsService, CampaignFilters } from '@/lib/services/campaigns.service'
import { logger } from '@/lib/utils/logger'

interface UseCampaignsResult {
  campaigns: Campaign[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCampaigns(filters?: Partial<CampaignFilters>): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaigns = useCallback(async () => {
    logger.info('useCampaigns: Starting fetch', { filters })
    setLoading(true)
    setError(null)

    try {
      const data = await campaignsService.getAll(filters)
      logger.info('useCampaigns: Data received', { count: data.length, data })
      setCampaigns(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch campaigns in hook', { error: error.message, stack: error.stack })
    } finally {
      setLoading(false)
      logger.info('useCampaigns: Fetch completed')
    }
  }, [filters?.type, filters?.status, filters?.fromDate, filters?.toDate])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  return {
    campaigns,
    loading,
    error,
    refetch: fetchCampaigns,
  }
}
