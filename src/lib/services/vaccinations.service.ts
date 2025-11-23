import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Vaccination, CreateVaccinationDto, UpdateVaccinationDto, VaccinationFilters } from '@/lib/types/vaccination';

const TEMP_FARM_ID = 'd3934abb-13d2-4950-8d1c-f8ab4628e762';

class VaccinationsService {
  async getAll(filters?: Partial<VaccinationFilters>): Promise<Vaccination[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.targetType && filters.targetType !== 'all') params.append('targetType', filters.targetType);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);

      const url = `/farms/${TEMP_FARM_ID}/vaccinations${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<{ data: Vaccination[] }>(url);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No vaccinations found (404)');
        return [];
      }
      logger.error('Failed to fetch vaccinations', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Vaccination> {
    const response = await apiClient.get<{ data: Vaccination }>(`/farms/${TEMP_FARM_ID}/vaccinations/${id}`);
    return response.data;
  }

  async getByAnimalId(animalId: string): Promise<Vaccination[]> {
    try {
      const response = await apiClient.get<{ data: Vaccination[] }>(`/farms/${TEMP_FARM_ID}/animals/${animalId}/vaccinations`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info(`No vaccinations found for animal ${animalId} (404)`);
        return [];
      }
      throw error;
    }
  }

  async create(data: CreateVaccinationDto): Promise<Vaccination> {
    const response = await apiClient.post<{ data: Vaccination }>(`/farms/${TEMP_FARM_ID}/vaccinations`, data);
    return response.data;
  }

  async update(id: string, data: UpdateVaccinationDto): Promise<Vaccination> {
    const response = await apiClient.patch<{ data: Vaccination }>(`/farms/${TEMP_FARM_ID}/vaccinations/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/vaccinations/${id}`);
  }
}

export const vaccinationsService = new VaccinationsService();
