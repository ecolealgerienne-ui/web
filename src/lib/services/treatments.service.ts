/**
 * Service pour la gestion des traitements
 * Endpoint: /api/v1/farms/{farmId}/treatments
 */

import { apiClient } from '@/lib/api/client';
import { Treatment, TreatmentFilters, CreateTreatmentDto, UpdateTreatmentDto } from '@/lib/types/treatment';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import type { PaginatedResponse } from '@/lib/types/common/api';

/**
 * Paramètres de filtre pour la liste des traitements
 */
export interface TreatmentFilterParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  animalId?: string;
  productId?: string;
  lotId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

class TreatmentsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/treatments`;
  }

  private getAnimalTreatmentsPath(animalId: string): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/animals/${animalId}/treatments`;
  }

  /**
   * Récupère la liste paginée des traitements
   */
  async getAll(params: TreatmentFilterParams = {}): Promise<PaginatedResponse<Treatment>> {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      const page = params.page || 1;
      const limit = Math.min(params.limit || 25, 100);
      queryParams.append('page', String(page));
      queryParams.append('limit', String(limit));

      // Filtres
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params.animalId) queryParams.append('animalId', params.animalId);
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.lotId) queryParams.append('lotId', params.lotId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);

      const url = `${this.getBasePath()}?${queryParams.toString()}`;
      const response = await apiClient.get<PaginatedResponse<Treatment> | Treatment[]>(url);

      // Handle both paginated and non-paginated responses from backend
      let treatments: Treatment[];
      let meta: { total: number; page: number; limit: number; totalPages: number };

      if (Array.isArray(response)) {
        // Backend returns array (non-paginated fallback)
        treatments = response;
        meta = {
          total: treatments.length,
          page,
          limit,
          totalPages: Math.ceil(treatments.length / limit)
        };
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        // Backend returns paginated response
        treatments = response.data;
        meta = response.meta || {
          total: treatments.length,
          page,
          limit,
          totalPages: Math.ceil(treatments.length / limit)
        };
      } else {
        // Fallback for unexpected format
        treatments = [];
        meta = { total: 0, page, limit, totalPages: 0 };
      }

      logger.info('Treatments fetched', {
        total: meta.total,
        page: meta.page,
        limit: meta.limit
      });

      return { data: treatments, meta };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No treatments found (404)');
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
      logger.error('Failed to fetch treatments', { error });
      throw error;
    }
  }

  /**
   * Récupère les traitements d'un animal spécifique
   */
  async getByAnimalId(animalId: string): Promise<Treatment[]> {
    try {
      const url = this.getAnimalTreatmentsPath(animalId);
      const response = await apiClient.get<Treatment[]>(url);
      logger.info('Animal treatments fetched', { animalId, count: (response || []).length });
      return response || [];
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No treatments found for animal (404)', { animalId });
        return [];
      }
      logger.error('Failed to fetch animal treatments', { error, animalId });
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
