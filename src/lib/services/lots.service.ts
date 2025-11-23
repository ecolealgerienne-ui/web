/**
 * Service pour la gestion des lots
 */

import { apiClient } from '@/lib/api/client';
import { Lot, LotFilters, LotAnimal } from '@/lib/types/lot';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';


export interface CreateLotDto {
  name: string;
  type: string;
  status?: string;
  description?: string;
  completed?: boolean;
  completedAt?: string;
  productId?: string;
  productName?: string;
  treatmentDate?: string;
  withdrawalEndDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  priceTotal?: number;
  buyerName?: string;
  sellerName?: string;
  notes?: string;
}

export interface UpdateLotDto extends Partial<CreateLotDto> {}

class LotsService {
  private getBasePath(): string {
    return `/farms/${TEMP_FARM_ID}/lots`;
  }

  async getAll(filters?: Partial<LotFilters>): Promise<Lot[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: Lot[] }>(url);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No lots found (404)');
        return [];
      }
      logger.error('Failed to fetch lots', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<Lot | null> {
    try {
      const response = await apiClient.get<Lot>(`${this.getBasePath()}/${id}`);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Lot not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch lot', { error, id });
      throw error;
    }
  }

  async getLotAnimals(lotId: string): Promise<LotAnimal[]> {
    try {
      const response = await apiClient.get<{ data: LotAnimal[] }>(`${this.getBasePath()}/${lotId}/animals`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
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

  async addAnimal(lotId: string, animalId: string): Promise<void> {
    // API expects animalIds (plural) as array
    await apiClient.post(`${this.getBasePath()}/${lotId}/animals`, { animalIds: [animalId] });
    logger.info('Animal added to lot', { lotId, animalId });
  }

  async removeAnimal(lotId: string, animalId: string): Promise<void> {
    // API expects DELETE with body containing animalIds array
    await apiClient.delete(`${this.getBasePath()}/${lotId}/animals`, { animalIds: [animalId] });
    logger.info('Animal removed from lot', { lotId, animalId });
  }
}

export const lotsService = new LotsService();
