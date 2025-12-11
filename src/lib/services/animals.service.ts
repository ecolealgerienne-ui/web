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
  sex?: 'male' | 'female'
  search?: string
  limit?: number
  page?: number
  // Filters for dashboard actions
  notWeighedDays?: number  // Animals not weighed for X days
  minWeight?: number       // Minimum weight (kg)
  maxWeight?: number       // Maximum weight (kg)
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated response
 */
export interface PaginatedAnimalsResponse {
  animals: Animal[]
  meta: PaginationMeta
}

class AnimalsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/animals`;
  }

  /**
   * Get all animals with pagination
   */
  async getAll(filters?: AnimalsFilterParams): Promise<Animal[]> {
    const result = await this.getAllPaginated(filters);
    return result.animals;
  }

  /**
   * Get all animals with pagination metadata
   */
  async getAllPaginated(filters?: AnimalsFilterParams): Promise<PaginatedAnimalsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.speciesId) params.append('speciesId', filters.speciesId);
      if (filters?.sex) params.append('sex', filters.sex);
      if (filters?.search) params.append('search', filters.search);

      // Filters for dashboard actions
      if (filters?.notWeighedDays) params.append('notWeighedDays', String(filters.notWeighedDays));
      if (filters?.minWeight) params.append('minWeight', String(filters.minWeight));
      if (filters?.maxWeight) params.append('maxWeight', String(filters.maxWeight));

      // Pagination
      const limit = filters?.limit || 10;
      const page = filters?.page || 1;
      params.append('limit', String(limit));
      params.append('page', String(page));

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      // API returns: { data: [...], meta: {...} } after apiClient unwrapping
      const response = await apiClient.get<{ data: Animal[]; meta?: any }>(url);

      const animals = response?.data || [];
      const meta = response?.meta || {};

      logger.info('Animals fetched', { count: animals.length, page, total: meta.total });

      return {
        animals,
        meta: {
          total: meta.total || animals.length,
          page: meta.page || page,
          limit: meta.limit || limit,
          totalPages: meta.totalPages || meta.pages || Math.ceil((meta.total || animals.length) / limit),
        },
      };
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No animals found (404)');
        return { animals: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
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
