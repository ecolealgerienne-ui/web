/**
 * Service pour le catalogue produits (endpoint farm-scoped avec filtres)
 */

import { apiClient } from '@/lib/api/client'
import { logger } from '@/lib/utils/logger'
import type { Product, CatalogFilters } from '@/lib/types/admin/product'
import type { PaginatedResponse } from '@/lib/types/common/api'

class CatalogService {
  private getBaseUrl(farmId: string) {
    return `/api/v1/farms/${farmId}/products/catalog`
  }

  /**
   * Récupère les produits du catalogue avec filtres
   */
  async getProducts(
    farmId: string,
    filters?: CatalogFilters
  ): Promise<PaginatedResponse<Product>> {
    try {
      logger.info('Fetching catalog products', { farmId, filters })

      const queryParams = new URLSearchParams()

      if (filters?.search) queryParams.append('search', filters.search)
      if (filters?.species && filters.species !== 'all') {
        queryParams.append('species', filters.species)
      }
      if (filters?.type && filters.type !== 'all') {
        queryParams.append('type', filters.type)
      }
      if (filters?.therapeuticForm && filters.therapeuticForm !== 'all') {
        queryParams.append('therapeuticForm', filters.therapeuticForm)
      }
      if (filters?.prescription && filters.prescription !== 'all') {
        queryParams.append('prescription', filters.prescription)
      }
      if (filters?.withdrawal && filters.withdrawal !== 'all') {
        queryParams.append('withdrawal', filters.withdrawal)
      }
      if (filters?.page) queryParams.append('page', String(filters.page))
      if (filters?.limit) queryParams.append('limit', String(filters.limit))

      const url = queryParams.toString()
        ? `${this.getBaseUrl(farmId)}?${queryParams.toString()}`
        : this.getBaseUrl(farmId)

      const response = await apiClient.get<PaginatedResponse<Product>>(url)

      logger.info('Catalog products fetched', {
        farmId,
        count: response.data.length,
        total: response.meta.total,
      })

      return response
    } catch (error) {
      logger.error('Failed to fetch catalog products', { error, farmId, filters })
      throw error
    }
  }
}

export const catalogService = new CatalogService()
