import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Vaccination, CreateVaccinationDto, UpdateVaccinationDto, VaccinationFilters } from '@/lib/types/vaccination';
import { TEMP_FARM_ID } from '@/lib/auth/config';


class VaccinationsService {
  async getAll(filters?: Partial<VaccinationFilters>): Promise<Vaccination[]> {
    try {
      const params = new URLSearchParams();
      // Map frontend filters to API query params as per WEB_API_SPECIFICATIONS.md
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.targetType && filters.targetType !== 'all') params.append('type', filters.targetType);
      if (filters?.dateFrom) params.append('fromDate', filters.dateFrom);
      if (filters?.dateTo) params.append('toDate', filters.dateTo);
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
    // Use getAll with animalId filter as per API specs
    return this.getAll({ animalId });
  }

  async create(data: CreateVaccinationDto): Promise<Vaccination> {
    const response = await apiClient.post<{ data: Vaccination }>(`/farms/${TEMP_FARM_ID}/vaccinations`, data);
    return response.data;
  }

  async update(id: string, data: UpdateVaccinationDto): Promise<Vaccination> {
    // Use PUT as per API specs (not PATCH)
    const response = await apiClient.put<{ data: Vaccination }>(`/farms/${TEMP_FARM_ID}/vaccinations/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/vaccinations/${id}`);
  }
}

export const vaccinationsService = new VaccinationsService();
