/**
 * Service pour la gestion des événements d'animaux
 */

import { apiClient } from '@/lib/api/client';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';


class AnimalEventsService {
  private getBasePath(): string {
    return `/farms/${TEMP_FARM_ID}/animal-events`;
  }

  async getAll(filters?: { animalId?: string; eventType?: string; fromDate?: string; toDate?: string }): Promise<AnimalEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      const response = await apiClient.get<{ data: AnimalEvent[] }>(url);
      logger.info('Animal events fetched', { count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No animal events found (404)');
        return [];
      }
      logger.error('Failed to fetch animal events', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<AnimalEvent | null> {
    try {
      const response = await apiClient.get<AnimalEvent>(`${this.getBasePath()}/${id}`);
      logger.info('Animal event fetched', { id });
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Animal event not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch animal event', { error, id });
      throw error;
    }
  }

  async getByAnimalId(animalId: string): Promise<AnimalEvent[]> {
    try {
      const response = await apiClient.get<{ data: AnimalEvent[] }>(`${this.getBasePath()}?animalId=${animalId}`);
      logger.info('Animal events fetched for animal', { animalId, count: response.data?.length || 0 });
      return response.data || [];
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No animal events found for animal (404)', { animalId });
        return [];
      }
      logger.error('Failed to fetch animal events for animal', { error, animalId });
      throw error;
    }
  }

  async create(data: CreateAnimalEventDto): Promise<AnimalEvent> {
    const response = await apiClient.post<AnimalEvent>(this.getBasePath(), data);
    logger.info('Animal event created', { id: response.id });
    return response;
  }

  async update(id: string, data: UpdateAnimalEventDto): Promise<AnimalEvent> {
    const response = await apiClient.put<AnimalEvent>(`${this.getBasePath()}/${id}`, data);
    logger.info('Animal event updated', { id });
    return response;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Animal event deleted', { id });
  }
}

export const animalEventsService = new AnimalEventsService();
