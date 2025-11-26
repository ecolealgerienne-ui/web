/**
 * Service pour la gestion des traitements
 */

import { apiClient } from '@/lib/api/client';
import { Treatment, TreatmentFilters } from '@/lib/types/treatment';
import { logger } from '@/lib/utils/logger';

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e';

interface CreateTreatmentDto {
  // XOR: soit animalId, soit animal_ids (batch)
  animalId?: string;
  animal_ids?: string[];

  productId: string;
  productName: string;
  treatmentDate: string; // ISO 8601
  dose: number;
  dosageUnit: string; // ml, mg, g, comprimé
  withdrawalEndDate: string; // ISO 8601, REQUIRED

  veterinarianId?: string;
  veterinarianName?: string;
  campaignId?: string;
  diagnosis?: string;
  duration?: number; // jours
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  administrationRoute?: string; // IM, SC, oral, etc.
  cost?: number;
  notes?: string;
}

interface UpdateTreatmentDto {
  productId?: string;
  productName?: string;
  treatmentDate?: string;
  dose?: number;
  dosageUnit?: string;
  withdrawalEndDate?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  campaignId?: string;
  diagnosis?: string;
  duration?: number;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  administrationRoute?: string;
  cost?: number;
  notes?: string;
}

class TreatmentsService {
  private getBasePath(): string {
    return `/farms/${TEMP_FARM_ID}/treatments`;
  }

  /**
   * Récupère tous les traitements avec filtres
   * @param filters - Filtres optionnels (animalId, status, dateFrom, dateTo)
   */
  async getAll(filters?: Partial<TreatmentFilters> & { animalId?: string }): Promise<Treatment[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.dateFrom) params.append('fromDate', filters.dateFrom);
      if (filters?.dateTo) params.append('toDate', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: Treatment[] }>(url);
      logger.info('Treatments fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No treatments found (404)');
        return [];
      }
      logger.error('Failed to fetch treatments', { error });
      throw error;
    }
  }

  /**
   * Récupère un traitement par ID
   */
  async getById(id: string): Promise<Treatment | null> {
    try {
      const response = await apiClient.get<Treatment>(`${this.getBasePath()}/${id}`);
      logger.info('Treatment fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Treatment not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch treatment', { error, id });
      throw error;
    }
  }

  /**
   * Crée un traitement (simple ou batch)
   * @param data - Données du traitement (animalId XOR animal_ids)
   */
  async create(data: CreateTreatmentDto): Promise<Treatment> {
    // Validation XOR
    if (data.animalId && data.animal_ids) {
      throw new Error('Provide either animalId OR animal_ids, not both');
    }
    if (!data.animalId && !data.animal_ids) {
      throw new Error('Either animalId or animal_ids is required');
    }

    const response = await apiClient.post<Treatment>(this.getBasePath(), data);
    logger.info('Treatment created', {
      id: response.id,
      productName: data.productName,
      isBatch: !!data.animal_ids,
    });
    return response;
  }

  /**
   * Met à jour un traitement
   */
  async update(id: string, data: UpdateTreatmentDto): Promise<Treatment> {
    const response = await apiClient.put<Treatment>(`${this.getBasePath()}/${id}`, data);
    logger.info('Treatment updated', { id });
    return response;
  }

  /**
   * Supprime un traitement
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Treatment deleted', { id });
  }
}

export const treatmentsService = new TreatmentsService();
export type { CreateTreatmentDto, UpdateTreatmentDto };
