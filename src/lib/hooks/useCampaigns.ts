/**
 * Hook React pour la gestion des campagnes
 */

import { useState, useEffect, useCallback } from 'react'
import { Campaign, CampaignType, CampaignStatus } from '@/lib/types/campaign'
import { campaignsService } from '@/lib/services/campaigns.service'
import { logger } from '@/lib/utils/logger'

interface UseCampaignsResult {
  campaigns: Campaign[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCampaigns(filters?: { type?: CampaignType; status?: CampaignStatus }): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await campaignsService.getAll(filters)
      setCampaigns(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch campaigns in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [filters?.type, filters?.status])

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
