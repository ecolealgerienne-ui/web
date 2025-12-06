/**
 * Service pour la gestion des vaccinations
 */

import { apiClient } from '@/lib/api/client';
import { Vaccination, VaccinationFilters } from '@/lib/types/vaccination';
import { logger } from '@/lib/utils/logger';

const TEMP_FARM_ID = 'f9b1c8e0-7f3a-4b6d-9e2a-1c5d8f3b4a7e';

interface CreateVaccinationDto {
  // XOR: soit animalId, soit animal_ids (batch)
  animalId?: string;
  animal_ids?: string[];

  vaccineName: string;
  type: 'obligatoire' | 'recommandee' | 'preventive';
  disease: string;
  vaccinationDate: string; // ISO 8601
  nextDueDate?: string; // ISO 8601
  dose: string;
  administrationRoute: string; // IM, SC, etc.
  withdrawalPeriodDays: number;

  vaccineId?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  batchNumber?: string;
  expiryDate?: string;
  cost?: number;
  notes?: string;
}

interface UpdateVaccinationDto {
  vaccineName?: string;
  type?: 'obligatoire' | 'recommandee' | 'preventive';
  disease?: string;
  vaccinationDate?: string;
  nextDueDate?: string;
  dose?: string;
  administrationRoute?: string;
  withdrawalPeriodDays?: number;
  vaccineId?: string;
  veterinarianId?: string;
  veterinarianName?: string;
  batchNumber?: string;
  expiryDate?: string;
  cost?: number;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'overdue' | 'cancelled';
}

class VaccinationsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/vaccinations`;
  }

  /**
   * Récupère toutes les vaccinations avec filtres
   * @param filters - Filtres optionnels (animalId, type, dateFrom, dateTo, status)
   */
  async getAll(filters?: Partial<VaccinationFilters> & { animalId?: string }): Promise<Vaccination[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.dateFrom) params.append('fromDate', filters.dateFrom);
      if (filters?.dateTo) params.append('toDate', filters.dateTo);
      if (filters?.search) params.append('search', filters.search);

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: Vaccination[] }>(url);
      logger.info('Vaccinations fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No vaccinations found (404)');
        return [];
      }
      logger.error('Failed to fetch vaccinations', { error });
      throw error;
    }
  }

  /**
   * Récupère une vaccination par ID
   */
  async getById(id: string): Promise<Vaccination | null> {
    try {
      const response = await apiClient.get<Vaccination>(`${this.getBasePath()}/${id}`);
      logger.info('Vaccination fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Vaccination not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch vaccination', { error, id });
      throw error;
    }
  }

  /**
   * Crée une vaccination (simple ou batch)
   * @param data - Données de la vaccination (animalId XOR animal_ids)
   */
  async create(data: CreateVaccinationDto): Promise<Vaccination> {
    // Validation XOR
    if (data.animalId && data.animal_ids) {
      throw new Error('Provide either animalId OR animal_ids, not both');
    }
    if (!data.animalId && !data.animal_ids) {
      throw new Error('Either animalId or animal_ids is required');
    }

    const response = await apiClient.post<Vaccination>(this.getBasePath(), data);
    logger.info('Vaccination created', {
      id: response.id,
      vaccineName: data.vaccineName,
      isBatch: !!data.animal_ids,
    });
    return response;
  }

  /**
   * Met à jour une vaccination
   */
  async update(id: string, data: UpdateVaccinationDto): Promise<Vaccination> {
    const response = await apiClient.put<Vaccination>(`${this.getBasePath()}/${id}`, data);
    logger.info('Vaccination updated', { id });
    return response;
  }

  /**
   * Supprime une vaccination
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Vaccination deleted', { id });
  }
}

export const vaccinationsService = new VaccinationsService();
export type { CreateVaccinationDto, UpdateVaccinationDto };
