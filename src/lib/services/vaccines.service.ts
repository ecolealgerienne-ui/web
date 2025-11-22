/**
 * Service API pour la gestion des vaccins (CRUD Admin)
 *
 * Les vaccins sont des données de référence administrées.
 * CRUD complet disponible pour les super admins.
 */

import { apiClient } from '@/lib/api/client';
import { Vaccine, CreateVaccineDto, UpdateVaccineDto } from '@/lib/types/vaccine';
import { PaginatedResponse } from '@/lib/types/api';
import { logger } from '@/lib/utils/logger';

class VaccinesService {
  private basePath = '/api/v1/vaccines';

  /**
   * Récupère tous les vaccins
   */
  async getAll(): Promise<Vaccine[]> {
    try {
      // D'après les specs, l'API retourne { data: Vaccine[], total, limit, offset }
      const response = await apiClient.get<PaginatedResponse<Vaccine>>(this.basePath);

      logger.info('Vaccines fetched successfully', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch vaccines', { error });
      throw error;
    }
  }

  /**
   * Crée un nouveau vaccin (Admin)
   */
  async create(data: CreateVaccineDto): Promise<Vaccine> {
    try {
      // L'API retourne l'objet directement
      const vaccine = await apiClient.post<Vaccine>(this.basePath, data);

      logger.info('Vaccine created successfully', { id: vaccine.id });
      return vaccine;
    } catch (error) {
      logger.error('Failed to create vaccine', { error, data });
      throw error;
    }
  }

  /**
   * Met à jour un vaccin existant (Admin)
   */
  async update(id: string, data: UpdateVaccineDto): Promise<Vaccine> {
    try {
      const vaccine = await apiClient.put<Vaccine>(`${this.basePath}/${id}`, data);

      logger.info('Vaccine updated successfully', { id });
      return vaccine;
    } catch (error) {
      logger.error('Failed to update vaccine', { error, id, data });
      throw error;
    }
  }

  /**
   * Supprime un vaccin (soft delete - Admin)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`);
      logger.info('Vaccine deleted successfully', { id });
    } catch (error) {
      logger.error('Failed to delete vaccine', { error, id });
      throw error;
    }
  }
}

export const vaccinesService = new VaccinesService();
