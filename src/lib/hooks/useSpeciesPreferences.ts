/**
 * Hook React pour la gestion des préférences d'espèces par ferme
 */

import { useState, useEffect, useCallback } from 'react'
import { SpeciesPreference } from '@/lib/types/species-preference'
import { speciesPreferencesService } from '@/lib/services/species-preferences.service'
import { logger } from '@/lib/utils/logger'

interface UseSpeciesPreferencesResult {
  preferences: SpeciesPreference[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  savePreferences: (speciesIds: string[]) => Promise<void>
}

export function useSpeciesPreferences(farmId: string | undefined): UseSpeciesPreferencesResult {
  const [preferences, setPreferences] = useState<SpeciesPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPreferences = useCallback(async () => {
    if (!farmId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await speciesPreferencesService.getAll(farmId, false)
      setPreferences(data)
    } catch (err) {
      const error = err as Error
      setError(error)
      logger.error('Failed to fetch species preferences in hook', { error, farmId })
    } finally {
      setLoading(false)
    }
  }, [farmId])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const savePreferences = useCallback(async (speciesIds: string[]) => {
    if (!farmId) return

    try {
      await speciesPreferencesService.saveBatch(farmId, speciesIds)
      await fetchPreferences()
    } catch (err) {
      const error = err as Error
      logger.error('Failed to save species preferences', { error, farmId })
      throw error
    }
  }, [farmId, fetchPreferences])

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    savePreferences,
  }
}
