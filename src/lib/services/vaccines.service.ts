/**
 * Service pour la gestion des vaccins
 * Système Master Table : retourne vaccins global + local
 */

import { apiClient } from '@/lib/api/client';
import {
  Vaccine,
  CreateVaccineDto,
  UpdateVaccineDto,
  VaccineFilters,
} from '@/lib/types/vaccine';
import { logger } from '@/lib/utils/logger';

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e';

class VaccinesService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/vaccines`;
  }

  /**
   * Récupère tous les vaccins (global + local)
   * @param filters - Filtres optionnels (search, scope, targetDisease, isActive)
   */
  async getAll(filters?: VaccineFilters): Promise<Vaccine[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.scope && filters.scope !== 'all') params.append('scope', filters.scope);
      if (filters?.targetDisease) params.append('targetDisease', filters.targetDisease);
      if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: Vaccine[] }>(url);
      logger.info('Vaccines fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No vaccines found (404)');
        return [];
      }
      logger.error('Failed to fetch vaccines', { error });
      throw error;
    }
  }

  /**
   * Récupère un vaccin par ID
   */
  async getById(id: string): Promise<Vaccine | null> {
    try {
      const response = await apiClient.get<Vaccine>(`${this.getBasePath()}/${id}`);
      logger.info('Vaccine fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Vaccine not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch vaccine', { error, id });
      throw error;
    }
  }

  /**
   * Crée un vaccin local (scope=local)
   */
  async create(data: CreateVaccineDto): Promise<Vaccine> {
    const response = await apiClient.post<Vaccine>(this.getBasePath(), data);
    logger.info('Vaccine created', { id: response.id, nameFr: data.nameFr });
    return response;
  }

  /**
   * Met à jour un vaccin
   */
  async update(id: string, data: UpdateVaccineDto): Promise<Vaccine> {
    const response = await apiClient.put<Vaccine>(`${this.getBasePath()}/${id}`, data);
    logger.info('Vaccine updated', { id });
    return response;
  }

  /**
   * Supprime un vaccin
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Vaccine deleted', { id });
  }
}

export const vaccinesService = new VaccinesService();
