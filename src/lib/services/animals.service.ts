/**
 * Service pour la gestion des animaux
 */

import { apiClient } from '@/lib/api/client';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';


/**
 * Filter parameters for animals list
 */
export interface AnimalsFilterParams {
  status?: string
  speciesId?: string
  search?: string
  limit?: number
  page?: number
  // Filters for dashboard actions
  notWeighedDays?: number  // Animals not weighed for X days
  minWeight?: number       // Minimum weight (kg)
  maxWeight?: number       // Maximum weight (kg)
}

class AnimalsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/animals`;
  }

  async getAll(filters?: AnimalsFilterParams): Promise<Animal[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.speciesId) params.append('speciesId', filters.speciesId);
      if (filters?.search) params.append('search', filters.search);

      // Filters for dashboard actions
      if (filters?.notWeighedDays) params.append('notWeighedDays', String(filters.notWeighedDays));
      if (filters?.minWeight) params.append('minWeight', String(filters.minWeight));
      if (filters?.maxWeight) params.append('maxWeight', String(filters.maxWeight));

      // L'API backend a une limite maximale de 100 et utilise 'page' pour la pagination
      const limit = Math.min(filters?.limit || 100, 100); // Max 100
      params.append('limit', String(limit));
      if (filters?.page) params.append('page', String(filters.page));

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: Animal[] }>(url);
      logger.info('Animals fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No animals found (404)');
        return [];
      }
      logger.error('Failed to fetch animals', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<Animal | null> {
    try {
      const response = await apiClient.get<Animal>(`${this.getBasePath()}/${id}`);
      logger.info('Animal fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Animal not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch animal', { error, id });
      throw error;
    }
  }

  async create(data: CreateAnimalDto): Promise<Animal> {
    const response = await apiClient.post<Animal>(this.getBasePath(), data);
    logger.info('Animal created', { id: response.id });
    return response;
  }

  async update(id: string, data: UpdateAnimalDto): Promise<Animal> {
    const response = await apiClient.put<Animal>(`${this.getBasePath()}/${id}`, data);
    logger.info('Animal updated', { id });
    return response;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Animal deleted', { id });
  }
}

export const animalsService = new AnimalsService();
