/**
 * Hook React pour la gestion des campagnes
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Campaign, CampaignType, CampaignStatus } from '@/lib/types/campaign'
import { campaignsService } from '@/lib/services/campaigns.service'
import { logger } from '@/lib/utils/logger'

interface UseCampaignsResult {
  campaigns: Campaign[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCampaigns(filters?: { type?: CampaignType | 'all'; status?: CampaignStatus | 'all' }): UseCampaignsResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Extraire les valeurs des filtres pour éviter les re-renders inutiles
  const filterType = filters?.type
  const filterStatus = filters?.status

  const memoizedFilters = useMemo(() => ({
    type: filterType,
    status: filterStatus,
  }), [filterType, filterStatus])

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await campaignsService.getAll(memoizedFilters)
      setCampaigns(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch campaigns in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [memoizedFilters])

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
