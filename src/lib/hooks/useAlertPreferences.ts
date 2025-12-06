/**
 * Hook React pour la gestion des préférences d'alertes d'une ferme
 * Utilise l'endpoint /api/v1/farms/{farmId}/alert-preferences
 */

import { useState, useEffect, useCallback } from 'react'
import { AlertPreference } from '@/lib/types/alert-preference'
import { alertPreferencesService } from '@/lib/services/alert-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseAlertPreferencesResult {
  preferences: AlertPreference[]
  loading: boolean
  error: Error | null
  savePreferences: (alertTemplateIds: string[]) => Promise<void>
  refetch: () => Promise<void>
}

export function useAlertPreferences(farmId: string | undefined): UseAlertPreferencesResult {
  const [preferences, setPreferences] = useState<AlertPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!farmId) {
      setPreferences([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await alertPreferencesService.getAll(farmId)
      setPreferences(data)
      logger.info('Alert preferences fetched successfully', { farmId, count: data.length })
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch alert preferences in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  const savePreferences = useCallback(async (alertTemplateIds: string[]) => {
    if (!farmId) {
      throw new Error('No farm ID provided')
    }

    await alertPreferencesService.saveBatch(farmId, alertTemplateIds)
    await fetchPreferences()
  }, [farmId, fetchPreferences])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  return {
    preferences,
    loading,
    error,
    savePreferences,
    refetch: fetchPreferences,
  }
}
