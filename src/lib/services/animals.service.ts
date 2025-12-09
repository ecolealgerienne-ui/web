/**
 * Service pour la gestion des animaux
 *
 * Conforme aux normes DEVELOPMENT_STANDARDS.md
 */

import { apiClient } from '@/lib/api/client';
import { Animal, CreateAnimalDto, UpdateAnimalDto } from '@/lib/types/animal';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import type { PaginatedResponse } from '@/lib/types/common/api';

/**
 * Paramètres de filtre pour la liste des animaux
 */
export interface AnimalFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  speciesId?: string;
  breedId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AnimalsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/animals`;
  }

  /**
   * Récupère la liste paginée des animaux
   */
  async getAll(params: AnimalFilterParams = {}): Promise<PaginatedResponse<Animal>> {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      const page = params.page || 1;
      const limit = Math.min(params.limit || 25, 100); // Max 100
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));

      // Filtres
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.speciesId && params.speciesId !== '__all__') {
        queryParams.append('speciesId', params.speciesId);
      }
      if (params.breedId && params.breedId !== '__all__') {
        queryParams.append('breedId', params.breedId);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }

      // Tri
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
        queryParams.append('sortOrder', params.sortOrder || 'asc');
      }

      const url = `${this.getBasePath()}?${queryParams.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Animal>>(url);

      logger.info('Animals fetched', {
        total: response.meta?.total || response.data?.length || 0,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit
      });

      // Si l'API ne retourne pas de meta, on construit une réponse compatible
      if (!response.meta) {
        const data = (response as any).data || [];
        return {
          data,
          meta: {
            total: data.length,
            page,
            limit,
            totalPages: Math.ceil(data.length / limit)
          }
        };
      }

      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No animals found (404)');
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
