/**
 * Service API pour la gestion des préférences de produits par ferme
 */

import { apiClient } from '@/lib/api/client'
import {
  ProductPreference,
  CreateProductPreferenceDto,
} from '@/lib/types/product-preference'
import { logger } from '@/lib/utils/logger'

class ProductPreferencesService {
  private getBasePath(farmId: string) {
    return `/api/v1/farms/${farmId}/product-preferences`
  }

  async getAll(farmId: string, includeInactive = false): Promise<ProductPreference[]> {
    try {
      const params = new URLSearchParams()
      params.append('includeInactive', String(includeInactive))

      const url = `${this.getBasePath(farmId)}?${params}`
      logger.info('Fetching product preferences', { farmId, url, includeInactive })

      const response = await apiClient.get<ProductPreference[]>(url)

      logger.info('Product preferences fetched', {
        farmId,
        count: response?.length || 0,
        hasData: !!response
      })
      return response || []
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No product preferences found (404)', { farmId, url: this.getBasePath(farmId) })
        return []
      }
      logger.error('Failed to fetch product preferences', { error, farmId })
      throw error
    }
  }

  async create(farmId: string, data: CreateProductPreferenceDto): Promise<ProductPreference> {
    try {
      const response = await apiClient.post<ProductPreference>(this.getBasePath(farmId), data)
      logger.info('Product preference created', { farmId, preferenceId: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create product preference', { error, farmId })
      throw error
    }
  }

  async delete(farmId: string, id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.getBasePath(farmId)}/${id}`)
      logger.info('Product preference deleted', { farmId, id })
    } catch (error) {
      logger.error('Failed to delete product preference', { error, farmId, id })
      throw error
    }
  }

  /**
   * Sauvegarde en batch les préférences
   */
  async saveBatch(farmId: string, productIds: string[]): Promise<ProductPreference[]> {
    try {
      const existingPreferences = await this.getAll(farmId, true)
      const existingProductIds = new Set(existingPreferences.map(p => p.productId))
      const newProductIds = new Set(productIds)

      // Supprimer les préférences qui ne sont plus dans la liste
      const preferencesToDelete = existingPreferences.filter(p => !newProductIds.has(p.productId))
      for (const pref of preferencesToDelete) {
        await this.delete(farmId, pref.id)
      }

      // Créer les nouvelles préférences
      const allPreferences: ProductPreference[] = []

      for (const productId of productIds) {
        if (existingProductIds.has(productId)) {
          // Le produit existe déjà, on le garde tel quel
          const existingPref = existingPreferences.find(p => p.productId === productId)!
          allPreferences.push(existingPref)
        } else {
          // Nouveau produit - l'API n'accepte que productId
          const newPref = await this.create(farmId, {
            productId: productId,
          })
          allPreferences.push(newPref)
        }
      }

      return allPreferences
    } catch (error) {
      logger.error('Failed to save product preferences batch', { error, farmId })
      throw error
    }
  }
}

export const productPreferencesService = new ProductPreferencesService()
