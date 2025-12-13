/**
 * Service API pour les lots de produits médicaments (FarmerProductLot)
 *
 * URL: /api/v1/farms/:farmId/product-configs/:configId/lots
 */

import { apiClient } from '@/lib/api/client'
import {
  FarmerProductLot,
  CreateFarmerProductLotDto,
  UpdateFarmerProductLotDto,
} from '@/lib/types/farmer-product-lot'
import { logger } from '@/lib/utils/logger'

class FarmerProductLotsService {
  private getBasePath(farmId: string, configId: string) {
    return `/api/v1/farms/${farmId}/product-configs/${configId}/lots`
  }

  /**
   * Liste tous les lots d'une préférence de produit
   */
  async getAll(
    farmId: string,
    configId: string,
    includeInactive = false
  ): Promise<FarmerProductLot[]> {
    try {
      const params = new URLSearchParams()
      if (!includeInactive) {
        params.append('isActive', 'true')
      }

      const url = `${this.getBasePath(farmId, configId)}?${params}`
      logger.info('Fetching farmer product lots', { farmId, configId, url })

      const response = await apiClient.get<FarmerProductLot[]>(url)
      return response || []
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err.status === 404) {
        logger.info('No lots found (404)', { farmId, configId })
        return []
      }
      logger.error('Failed to fetch farmer product lots', { error, farmId, configId })
      throw error
    }
  }

  /**
   * Liste uniquement les lots actifs et non périmés
   */
  async getActiveLots(farmId: string, configId: string): Promise<FarmerProductLot[]> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/active`
      const response = await apiClient.get<FarmerProductLot[]>(url)
      return response || []
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err.status === 404) {
        return []
      }
      logger.error('Failed to fetch active lots', { error, farmId, configId })
      throw error
    }
  }

  /**
   * Récupère un lot par ID
   */
  async getById(
    farmId: string,
    configId: string,
    lotId: string
  ): Promise<FarmerProductLot | null> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/${lotId}`
      return await apiClient.get<FarmerProductLot>(url)
    } catch (error: unknown) {
      const err = error as { status?: number }
      if (err.status === 404) {
        return null
      }
      logger.error('Failed to fetch lot', { error, farmId, configId, lotId })
      throw error
    }
  }

  /**
   * Crée un nouveau lot
   */
  async create(
    farmId: string,
    configId: string,
    data: CreateFarmerProductLotDto
  ): Promise<FarmerProductLot> {
    try {
      const url = this.getBasePath(farmId, configId)
      const response = await apiClient.post<FarmerProductLot>(url, data)
      logger.info('Lot created', { farmId, configId, lotId: response.id })
      return response
    } catch (error) {
      logger.error('Failed to create lot', { error, farmId, configId })
      throw error
    }
  }

  /**
   * Met à jour un lot
   */
  async update(
    farmId: string,
    configId: string,
    lotId: string,
    data: UpdateFarmerProductLotDto
  ): Promise<FarmerProductLot> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/${lotId}`
      const response = await apiClient.put<FarmerProductLot>(url, data)
      logger.info('Lot updated', { farmId, configId, lotId })
      return response
    } catch (error) {
      logger.error('Failed to update lot', { error, farmId, configId, lotId })
      throw error
    }
  }

  /**
   * Active un lot
   */
  async activate(
    farmId: string,
    configId: string,
    lotId: string
  ): Promise<FarmerProductLot> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/${lotId}/activate`
      const response = await apiClient.patch<FarmerProductLot>(url, {})
      logger.info('Lot activated', { farmId, configId, lotId })
      return response
    } catch (error) {
      logger.error('Failed to activate lot', { error, farmId, configId, lotId })
      throw error
    }
  }

  /**
   * Désactive un lot
   */
  async deactivate(
    farmId: string,
    configId: string,
    lotId: string
  ): Promise<FarmerProductLot> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/${lotId}/deactivate`
      const response = await apiClient.patch<FarmerProductLot>(url, {})
      logger.info('Lot deactivated', { farmId, configId, lotId })
      return response
    } catch (error) {
      logger.error('Failed to deactivate lot', { error, farmId, configId, lotId })
      throw error
    }
  }

  /**
   * Supprime un lot (soft delete)
   */
  async delete(farmId: string, configId: string, lotId: string): Promise<void> {
    try {
      const url = `${this.getBasePath(farmId, configId)}/${lotId}`
      await apiClient.delete(url)
      logger.info('Lot deleted', { farmId, configId, lotId })
    } catch (error) {
      logger.error('Failed to delete lot', { error, farmId, configId, lotId })
      throw error
    }
  }
}

export const farmerProductLotsService = new FarmerProductLotsService()
