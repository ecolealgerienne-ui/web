import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/utils/logger';
import type { Treatment, TreatmentFilters } from '@/lib/types/treatment';
import { TEMP_FARM_ID } from '@/lib/auth/config';


export interface CreateTreatmentDto {
  animalId?: string;
  lotId?: string;
  targetType: 'individual' | 'lot';
  productId?: string;
  productName: string;
  treatmentType: string;
  manufacturer?: string;
  batchNumber?: string;
  reason: string;
  diagnosis?: string;
  dosage: string;
  administrationRoute?: string;
  frequency?: string;
  duration?: number;
  startDate: string;
  endDate?: string;
  administeredBy?: string;
  veterinarianId?: string;
  prescriptionNumber?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  status?: string;
  notes?: string;
  cost?: number;
}

export interface UpdateTreatmentDto {
  animalId?: string;
  lotId?: string;
  targetType?: 'individual' | 'lot';
  productId?: string;
  productName?: string;
  treatmentType?: string;
  manufacturer?: string;
  batchNumber?: string;
  reason?: string;
  diagnosis?: string;
  dosage?: string;
  administrationRoute?: string;
  frequency?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  administeredBy?: string;
  veterinarianId?: string;
  prescriptionNumber?: string;
  withdrawalPeriodMeat?: number;
  withdrawalPeriodMilk?: number;
  status?: string;
  notes?: string;
  adverseReactions?: string;
  effectiveness?: string;
  cost?: number;
}

class TreatmentsService {
  async getAll(filters?: Partial<TreatmentFilters>): Promise<Treatment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.targetType && filters.targetType !== 'all') params.append('targetType', filters.targetType);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);

      const url = `/farms/${TEMP_FARM_ID}/treatments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get<{ data: Treatment[] }>(url);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No treatments found (404)');
        return [];
      }
      logger.error('Failed to fetch treatments', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Treatment> {
    const response = await apiClient.get<{ data: Treatment }>(`/farms/${TEMP_FARM_ID}/treatments/${id}`);
    return response.data;
  }

  async getByAnimalId(animalId: string): Promise<Treatment[]> {
    try {
      const response = await apiClient.get<{ data: Treatment[] }>(`/farms/${TEMP_FARM_ID}/animals/${animalId}/treatments`);
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info(`No treatments found for animal ${animalId} (404)`);
        return [];
      }
      throw error;
    }
  }

  async create(data: CreateTreatmentDto): Promise<Treatment> {
    const response = await apiClient.post<{ data: Treatment }>(`/farms/${TEMP_FARM_ID}/treatments`, data);
    return response.data;
  }

  async update(id: string, data: UpdateTreatmentDto): Promise<Treatment> {
    const response = await apiClient.patch<{ data: Treatment }>(`/farms/${TEMP_FARM_ID}/treatments/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/farms/${TEMP_FARM_ID}/treatments/${id}`);
  }
}

export const treatmentsService = new TreatmentsService();
