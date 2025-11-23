import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Weighing, WeighingFilters, CreateWeighingDto, UpdateWeighingDto } from '@/lib/types/weighing';

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e';

class WeighingsService {
  async getAll(filters?: Partial<WeighingFilters>): Promise<Weighing[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.purpose && filters.purpose !== 'all') params.append('purpose', filters.purpose);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.minWeight) params.append('minWeight', filters.minWeight.toString());
      if (filters?.maxWeight) params.append('maxWeight', filters.maxWeight.toString());
      if (filters?.search) params.append('search', filters.search);

      const url = `/farms/${TEMP_FARM_ID}/weighings${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<{ data: Weighing[] }>(url);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No weighings found (404)');
        return [];
      }
      logger.error('Failed to fetch weighings', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Weighing> {
    const response = await apiClient.get<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weighings/${id}`);
    return response.data;
  }

  async getByAnimalId(animalId: string): Promise<Weighing[]> {
    try {
      const response = await apiClient.get<{ data: Weighing[] }>(`/farms/${TEMP_FARM_ID}/animals/${animalId}/weighings`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info(`No weighings found for animal ${animalId} (404)`);
        return [];
      }
      throw error;
    }
  }

  async create(data: CreateWeighingDto): Promise<Weighing> {
    const response = await apiClient.post<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weighings`, data);
    return response.data;
  }

  async update(id: string, data: UpdateWeighingDto): Promise<Weighing> {
    const response = await apiClient.patch<{ data: Weighing }>(`/farms/${TEMP_FARM_ID}/weighings/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/weighings/${id}`);
  }
}

export const weighingsService = new WeighingsService();
