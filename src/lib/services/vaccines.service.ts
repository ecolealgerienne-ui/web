/**
 * Service pour la gestion des vaccins (catalogue de produits)
 * Note: As per WEB_API_SPECIFICATIONS.md section 3.4 Vaccines
 */

import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

export interface Vaccine {
  id: string;
  farmId: string;
  name: string;
  description?: string;
  manufacturer?: string;
  targetSpecies?: string[];
  targetDiseases?: string[];
  standardDose?: number;
  injectionsRequired?: number;
  injectionIntervalDays?: number;
  meatWithdrawalDays?: number;
  milkWithdrawalDays?: number;
  administrationRoute?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVaccineDto {
  name: string;
  description?: string;
  manufacturer?: string;
  targetSpecies?: string[];
  targetDiseases?: string[];
  standardDose?: number;
  injectionsRequired?: number;
  injectionIntervalDays?: number;
  meatWithdrawalDays?: number;
  milkWithdrawalDays?: number;
  administrationRoute?: string;
  isActive?: boolean;
}

export interface UpdateVaccineDto extends Partial<CreateVaccineDto> {}

export interface VaccineFilters {
  search?: string;
  isActive?: boolean;
}

class VaccinesService {
  async getAll(filters?: Partial<VaccineFilters>): Promise<Vaccine[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

      const url = `/farms/${TEMP_FARM_ID}/vaccines${params.toString() ? `?${params}` : ''}`;
      logger.info('Fetching vaccines from', { url });

      const response = await apiClient.get<any>(url);
      logger.info('Vaccines response received', {
        responseType: typeof response,
        isArray: Array.isArray(response),
        hasData: 'data' in response,
        response: JSON.stringify(response).substring(0, 200)
      });

      // Handle both response formats: { data: [...] } or direct array [...]
      let vaccines: Vaccine[];
      if (Array.isArray(response)) {
        vaccines = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        vaccines = response.data || [];
      } else {
        logger.warn('Unexpected response format', { response });
        vaccines = [];
      }

      logger.info('Vaccines fetched', { count: vaccines.length });
      return vaccines;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No vaccines found (404)');
        return [];
      }
      logger.error('Failed to fetch vaccines', { error: error.message, status: error.status });
      throw error;
    }
  }

  async getById(id: string): Promise<Vaccine | null> {
    try {
      const response = await apiClient.get<{ data: Vaccine }>(`/farms/${TEMP_FARM_ID}/vaccines/${id}`);
      logger.info('Vaccine fetched', { id });
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Vaccine not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch vaccine', { error, id });
      throw error;
    }
  }

  async create(data: CreateVaccineDto): Promise<Vaccine> {
    const response = await apiClient.post<{ data: Vaccine }>(`/farms/${TEMP_FARM_ID}/vaccines`, data);
    logger.info('Vaccine created', { id: response.data.id });
    return response.data;
  }

  async update(id: string, data: UpdateVaccineDto): Promise<Vaccine> {
    // Use PUT as per API specs
    const response = await apiClient.put<{ data: Vaccine }>(`/farms/${TEMP_FARM_ID}/vaccines/${id}`, data);
    logger.info('Vaccine updated', { id });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/vaccines/${id}`);
    logger.info('Vaccine deleted', { id });
  }
}

export const vaccinesService = new VaccinesService();
