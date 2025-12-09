/**
 * Service pour la gestion des lots
 * Endpoint: /api/v1/farms/{farmId}/lots
 */

import { apiClient } from '@/lib/api/client';
import { Lot, LotFilters, LotAnimal, CreateLotDto, UpdateLotDto } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import type { PaginatedResponse } from '@/lib/types/common/api';

/**
 * Paramètres de filtre pour la liste des lots
 */
export interface LotFilterParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  isActive?: boolean;
  search?: string;
  includeStats?: boolean;
}

class LotsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/lots`;
  }

  /**
   * Récupère la liste paginée des lots
   */
  async getAll(params: LotFilterParams = {}): Promise<PaginatedResponse<Lot>> {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      const page = params.page || 1;
      const limit = Math.min(params.limit || 25, 100);
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));

      // Filtres
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.includeStats) queryParams.append('includeStats', 'true');

      const url = `${this.getBasePath()}?${queryParams.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Lot> | Lot[]>(url);

      // Handle both paginated and non-paginated responses from backend
      let lots: Lot[];
      let meta: { total: number; page: number; limit: number; totalPages: number };

      if (Array.isArray(response)) {
        // Backend returns array (non-paginated fallback)
        lots = response;
        meta = {
          total: lots.length,
          page,
          limit,
          totalPages: Math.ceil(lots.length / limit)
        };
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        // Backend returns paginated response
        lots = response.data;
        meta = response.meta || {
          total: lots.length,
          page,
          limit,
          totalPages: Math.ceil(lots.length / limit)
        };
      } else {
        // Fallback for unexpected format
        lots = [];
        meta = { total: 0, page, limit, totalPages: 0 };
      }

      logger.info('Lots fetched', {
        total: meta.total,
        page: meta.page,
        limit: meta.limit
      });

      return { data: lots, meta };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No lots found (404)');
        return {
          data: [],
          meta: {
            total: 0,
            page: params.page || 1,
            limit: params.limit || 25,
            totalPages: 0
          }
        };
      }
      logger.error('Failed to fetch lots', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<Lot | null> {
    try {
      const response = await apiClient.get<Lot>(`${this.getBasePath()}/${id}`);
      logger.info('Lot fetched', { id });
      return response;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('Lot not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch lot', { error, id });
      throw error;
    }
  }

  async getLotAnimals(lotId: string): Promise<LotAnimal[]> {
    try {
      const response = await apiClient.get<LotAnimal[]>(`${this.getBasePath()}/${lotId}/animals`);
      logger.info('Lot animals fetched', { lotId, count: (response || []).length });
      return response || [];
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No animals found for lot (404)', { lotId });
        return [];
      }
      logger.error('Failed to fetch lot animals', { error, lotId });
      throw error;
    }
  }

  async create(data: CreateLotDto): Promise<Lot> {
    const response = await apiClient.post<Lot>(this.getBasePath(), data);
    logger.info('Lot created', { id: response.id });
    return response;
  }

  async update(id: string, data: UpdateLotDto): Promise<Lot> {
    const response = await apiClient.put<Lot>(`${this.getBasePath()}/${id}`, data);
    logger.info('Lot updated', { id });
    return response;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Lot deleted', { id });
  }

  async addAnimals(lotId: string, animalIds: string[]): Promise<void> {
    await apiClient.post(`${this.getBasePath()}/${lotId}/animals`, { animalIds });
    logger.info('Animals added to lot', { lotId, count: animalIds.length });
  }

  async removeAnimals(lotId: string, animalIds: string[]): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${lotId}/animals`, {
      body: JSON.stringify({ animalIds }),
      headers: { 'Content-Type': 'application/json' }
    });
    logger.info('Animals removed from lot', { lotId, count: animalIds.length });
  }

  // Convenience methods for single animal operations
  async addAnimal(lotId: string, animalId: string): Promise<void> {
    return this.addAnimals(lotId, [animalId]);
  }

  async removeAnimal(lotId: string, animalId: string): Promise<void> {
    return this.removeAnimals(lotId, [animalId]);
  }
}

export const lotsService = new LotsService();

// Re-export types for convenience
export type { CreateLotDto, UpdateLotDto };
