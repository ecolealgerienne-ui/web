/**
 * Service pour la gestion des traitements
 * Endpoint: /api/v1/farms/{farmId}/treatments
 */

import { apiClient } from '@/lib/api/client';
import { Treatment, TreatmentFilters, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

class TreatmentsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/treatments`;
  }

  private getAnimalTreatmentsPath(animalId: string): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/animals/${animalId}/treatments`;
  }

  /**
   * Récupère tous les traitements avec filtres API
   * @see GET /api/v1/farms/{farmId}/treatments
   */
  async getAll(filters?: Partial<TreatmentFilters>): Promise<Treatment[]> {
    try {
      const params = new URLSearchParams();

      // Filtres API
      if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.lotId) params.append('lotId', filters.lotId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      // API returns paginated response: { data: [...], meta: {...} }
      const response = await apiClient.get<{ data: Treatment[]; meta?: any }>(url);
      const treatments = response?.data || [];
      logger.info('Treatments fetched', { count: treatments.length });
      return treatments;
    } catch (error: unknown) {
      // Return empty array for any error to avoid breaking UI
      logger.warn('Failed to fetch treatments, returning empty array', { error });
      return [];
    }
  }

  /**
   * Récupère les traitements d'un animal spécifique
   */
  async getByAnimalId(animalId: string): Promise<Treatment[]> {
    try {
      const url = this.getAnimalTreatmentsPath(animalId);
      // API returns paginated response: { data: [...], meta: {...} }
      const response = await apiClient.get<{ data: Treatment[]; meta?: any }>(url);
      const treatments = response?.data || [];
      logger.info('Animal treatments fetched', { animalId, count: treatments.length });
      return treatments;
    } catch (error: unknown) {
      // Return empty array for any error to avoid breaking UI
      logger.warn('Failed to fetch animal treatments, returning empty', { animalId, error });
      return [];
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
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('Treatment not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch treatment', { error, id });
      throw error;
    }
  }

  /**
   * Crée un traitement
   */
  async create(data: CreateTreatmentDto): Promise<Treatment> {
    const response = await apiClient.post<Treatment>(this.getBasePath(), data);
    logger.info('Treatment created', { id: response.id, type: data.type });
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
