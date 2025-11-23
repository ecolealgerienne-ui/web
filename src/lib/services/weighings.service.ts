import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Weighing, WeighingFilters, CreateWeighingDto, UpdateWeighingDto } from '@/lib/types/weighing';
import { TEMP_FARM_ID } from '@/lib/auth/config';


class WeighingsService {
  async getAll(filters?: Partial<WeighingFilters>): Promise<Weighing[]> {
    try {
      const params = new URLSearchParams();
      // Map frontend filters to API query params as per WEB_API_SPECIFICATIONS.md
      // API endpoint is /weights (not /weighings)
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.source) params.append('source', filters.source);
      if (filters?.dateFrom) params.append('fromDate', filters.dateFrom);
      if (filters?.dateTo) params.append('toDate', filters.dateTo);

      const url = `/farms/${TEMP_FARM_ID}/weights${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<{ data: Weighing[] }>(url);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No weights found (404)');
        return [];
      }
      logger.error('Failed to fetch weights', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Weighing> {
    const response = await apiClient.get<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weights/${id}`);
    return response.data;
  }

  async getByAnimalId(animalId: string): Promise<Weighing[]> {
    // Use getAll with animalId filter as per API specs
    return this.getAll({ animalId });
  }

  async create(data: CreateWeighingDto): Promise<Weighing> {
    const response = await apiClient.post<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weights`, data);
    return response.data;
  }

  async update(id: string, data: UpdateWeighingDto): Promise<Weighing> {
    // Use PUT as per API specs (not PATCH)
    const response = await apiClient.put<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weights/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/weights/${id}`);
  }
}

export const weighingsService = new WeighingsService();
