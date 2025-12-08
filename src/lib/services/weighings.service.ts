import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Weighing, WeightHistory, WeightStats, QueryWeightDto, CreateWeightDto, UpdateWeightDto } from '@/lib/types/weighing';
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class WeighingsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/weights`;
  }

  async getAll(filters?: QueryWeightDto): Promise<PaginatedResponse<Weighing>> {
    try {
      const params = new URLSearchParams();

      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.source) params.append('source', filters.source);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.order) params.append('order', filters.order);

      const url = params.toString() ? `${this.getBasePath()}?${params.toString()}` : this.getBasePath();
      const response = await apiClient.get<PaginatedResponse<Weighing>>(url);
      return {
        data: response.data || [],
        meta: response.meta || { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No weights found (404)');
        return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
      logger.error('Failed to fetch weights', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Weighing> {
    const response = await apiClient.get<{ data: Weighing }>(`${this.getBasePath()}/${id}`);
    return response.data;
  }

  async getAnimalHistory(animalId: string): Promise<WeightHistory[]> {
    try {
      // apiClient auto-unwraps { success, data } -> returns data directly
      const response = await apiClient.get<WeightHistory[]>(
        `${this.getBasePath()}/animal/${animalId}/history`
      );
      return response || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info(`No weight history found for animal ${animalId}`);
        return [];
      }
      logger.error('Failed to fetch weight history', error);
      throw error;
    }
  }

  async create(data: CreateWeightDto): Promise<Weighing> {
    const response = await apiClient.post<{ data: Weighing }>(this.getBasePath(), data);
    return response.data;
  }

  async update(id: string, data: UpdateWeightDto): Promise<Weighing> {
    const response = await apiClient.put<{ data: Weighing }>(`${this.getBasePath()}/${id}`, data);
    return response.data;
  }

  async getStats(filters?: { fromDate?: string; toDate?: string }): Promise<WeightStats> {
    try {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const url = params.toString()
        ? `${this.getBasePath()}/stats?${params.toString()}`
        : `${this.getBasePath()}/stats`;

      // apiClient auto-unwraps { success, data } -> returns data directly
      // Note: backend currently double-wraps response, handle both cases
      const response = await apiClient.get<WeightStats | { success: boolean; data: WeightStats }>(url);

      // Handle double-wrapped response from backend
      if (response && 'success' in response && 'data' in response) {
        return (response as { success: boolean; data: WeightStats }).data;
      }
      return response as WeightStats;
    } catch (error: any) {
      logger.error('Failed to fetch weight stats', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
  }
}

export const weighingsService = new WeighingsService();
