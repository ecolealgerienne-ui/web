/**
 * Hook React pour les préférences de ferme
 */

import { useState, useEffect, useCallback } from 'react'
import { FarmPreference } from '@/lib/types/farm-preference'
import { farmPreferencesService } from '@/lib/services/farm-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseFarmPreferencesResult {
  preferences: FarmPreference | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useFarmPreferences(): UseFarmPreferencesResult {
  const [preferences, setPreferences] = useState<FarmPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreferences = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await farmPreferencesService.get()
      setPreferences(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch farm preferences in hook', { error })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
  }
}
