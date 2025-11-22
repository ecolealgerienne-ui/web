/**
 * Service API pour les préférences de ferme (singleton)
 */

import { apiClient } from '@/lib/api/client'
import { FarmPreference, UpdateFarmPreferenceDto } from '@/lib/types/farm-preference'
import { logger } from '@/lib/utils/logger'

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e'

class FarmPreferencesService {
  private getBasePath() {
    return `/farms/${TEMP_FARM_ID}/preferences`
  }

  async get(): Promise<FarmPreference | null> {
    try {
      const response = await apiClient.get<FarmPreference>(this.getBasePath())
      logger.info('Farm preferences fetched')
      return response
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No farm preferences found (404)')
        return null
      }
      logger.error('Failed to fetch farm preferences', { error })
      throw error
    }
  }

  async update(data: UpdateFarmPreferenceDto): Promise<FarmPreference> {
    try {
      const response = await apiClient.put<FarmPreference>(this.getBasePath(), data)
      logger.info('Farm preferences updated')
      return response
    } catch (error) {
      logger.error('Failed to update farm preferences', { error })
      throw error
    }
  }
}

export const farmPreferencesService = new FarmPreferencesService()
