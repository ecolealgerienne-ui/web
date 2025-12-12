/**
 * Service pour la gestion des lots
 * Endpoint: /api/v1/farms/{farmId}/lots
 */

import { apiClient } from '@/lib/api/client';
import { Lot, LotFilters, LotAnimal, CreateLotDto, UpdateLotDto } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

class LotsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/lots`;
  }

  async getAll(filters?: Partial<LotFilters>): Promise<Lot[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      // API returns paginated response: { data: [...], meta: {...} }
      const response = await apiClient.get<{ data: Lot[]; meta?: any }>(url);
      const lots = response?.data || [];
      logger.info('Lots fetched', { count: lots.length });
      return lots;
    } catch (error: unknown) {
      // Return empty array for any error to avoid breaking UI
      logger.warn('Failed to fetch lots, returning empty array', { error });
      return [];
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
