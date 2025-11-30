/**
 * Service pour la gestion des événements d'animaux
 * Note: Uses /movements API endpoint as per WEB_API_SPECIFICATIONS.md
 */

import { apiClient } from '@/lib/api/client';
import { AnimalEvent, CreateAnimalEventDto, UpdateAnimalEventDto } from '@/lib/types/animal-event';
import { logger } from '@/lib/utils/logger';
import { TEMP_FARM_ID } from '@/lib/auth/config';

<<<<<<< HEAD
// Backend Movement type (from API response)
interface BackendMovement {
  id: string;
  farmId: string;
  lotId: string | null;
  movementType: string;
  movementDate: string;
  reason: string | null;
  status: string;
  notes: string | null;
  movementAnimals: Array<{
    id: string;
    movementId: string;
    animalId: string;
    animal: {
      id: string;
      visualId: string | null;
      currentEid: string | null;
      sex: string;
    };
  }>;
  _count?: {
    movementAnimals: number;
  };
  createdAt: string;
  updatedAt: string;
  // ... autres champs optionnels
=======
// Type pour la réponse du backend (movements)
interface BackendMovement {
  id: string;
  farmId: string;
  animalId?: string;
  lotId?: string;
  movementType: string;
  movementDate: string;
  reason?: string;
  notes?: string;
  quantity?: number;
  sourceLocation?: string;
  destinationLocation?: string;
  performedBy?: string;
  veterinarianId?: string;
  cost?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Mapping backend movement -> frontend AnimalEvent
function mapMovementToEvent(movement: BackendMovement): AnimalEvent {
  return {
    id: movement.id,
    farmId: movement.farmId,
    animalId: movement.animalId || '',
    eventType: movement.movementType as AnimalEvent['eventType'],
    eventDate: movement.movementDate,
    title: movement.reason || formatEventTitle(movement.movementType),
    description: movement.notes,
    performedBy: movement.performedBy,
    veterinarianId: movement.veterinarianId,
    cost: movement.cost,
    location: movement.destinationLocation || movement.sourceLocation,
    createdAt: movement.createdAt,
    updatedAt: movement.updatedAt,
  };
}

// Générer un titre lisible pour l'événement
function formatEventTitle(movementType: string): string {
  const titles: Record<string, string> = {
    entry: 'Entrée',
    exit: 'Sortie',
    birth: 'Naissance',
    death: 'Décès',
    sale: 'Vente',
    purchase: 'Achat',
    transfer_in: 'Transfert entrant',
    transfer_out: 'Transfert sortant',
    temporary_out: 'Sortie temporaire',
    temporary_return: 'Retour temporaire',
  };
  return titles[movementType] || movementType;
>>>>>>> e20e61bd86ff804a2d2a6572dbafab410c4ef843
}

class AnimalEventsService {
  private getBasePath(): string {
    return `/farms/${TEMP_FARM_ID}/movements`;
  }

  /**
   * Transforme un Movement du backend vers un AnimalEvent frontend
   */
  private mapBackendMovementToAnimalEvent(movement: BackendMovement): AnimalEvent {
    // Récupérer le premier animal (ou utiliser un ID par défaut)
    const firstAnimal = movement.movementAnimals?.[0];
    const animalId = firstAnimal?.animalId || '';
    const animalDisplay = firstAnimal?.animal
      ? firstAnimal.animal.visualId || firstAnimal.animal.currentEid || firstAnimal.animal.id
      : 'Animal inconnu';

    // Créer un titre basé sur le type de mouvement
    const animalCount = movement._count?.movementAnimals || movement.movementAnimals?.length || 0;
    const animalText = animalCount > 1 ? `${animalCount} animaux` : animalDisplay;

    const typeLabels: Record<string, string> = {
      entry: 'Entrée',
      exit: 'Sortie',
      birth: 'Naissance',
      death: 'Décès',
      sale: 'Vente',
      purchase: 'Achat',
      transfer_in: 'Transfert entrant',
      transfer_out: 'Transfert sortant',
      temporary_out: 'Sortie temporaire',
      temporary_return: 'Retour',
    };

    const title = `${typeLabels[movement.movementType] || movement.movementType} - ${animalText}`;

    return {
      id: movement.id,
      farmId: movement.farmId,
      animalId: animalId,
      eventType: movement.movementType as any,
      eventDate: movement.movementDate,
      title: title,
      description: movement.reason || undefined,
      notes: movement.notes || undefined,
      createdAt: movement.createdAt,
      updatedAt: movement.updatedAt,
    };
  }

  async getAll(filters?: { animalId?: string; eventType?: string; fromDate?: string; toDate?: string }): Promise<AnimalEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      // Map eventType to movementType for API compatibility
      if (filters?.eventType && filters.eventType !== 'all') params.append('movementType', filters.eventType);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
<<<<<<< HEAD
      console.log('[Animal Events] Fetching movements from:', url);
      const response = await apiClient.get<{ data: BackendMovement[] }>(url);
      console.log('[Animal Events] Backend response:', response);

      // Mapper les données backend vers le format frontend
      const mappedEvents = response.data?.map(movement => this.mapBackendMovementToAnimalEvent(movement)) || [];
      console.log('[Animal Events] Mapped events:', mappedEvents);

      logger.info('Animal events (movements) fetched', { count: mappedEvents.length });
      return mappedEvents;
=======
      const response = await apiClient.get<{ data: BackendMovement[] }>(url);

      // Map backend movements to frontend AnimalEvent format
      const events = (response.data || []).map(mapMovementToEvent);
      logger.info('Animal events (movements) fetched', { count: events.length });
      return events;
>>>>>>> e20e61bd86ff804a2d2a6572dbafab410c4ef843
    } catch (error: any) {
      console.error('[Animal Events] Failed to fetch movements:', error);
      if (error.status === 404) {
        logger.info('No movements found (404)');
        return [];
      }
      logger.error('Failed to fetch movements', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<AnimalEvent | null> {
    try {
      const response = await apiClient.get<BackendMovement>(`${this.getBasePath()}/${id}`);
      logger.info('Movement fetched', { id });
<<<<<<< HEAD
      return this.mapBackendMovementToAnimalEvent(response);
=======
      return mapMovementToEvent(response);
>>>>>>> e20e61bd86ff804a2d2a6572dbafab410c4ef843
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('Movement not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch movement', { error, id });
      throw error;
    }
  }

  async getByAnimalId(animalId: string): Promise<AnimalEvent[]> {
    try {
      const response = await apiClient.get<{ data: BackendMovement[] }>(`${this.getBasePath()}?animalId=${animalId}`);
<<<<<<< HEAD
      const mappedEvents = response.data?.map(movement => this.mapBackendMovementToAnimalEvent(movement)) || [];
      logger.info('Movements fetched for animal', { animalId, count: mappedEvents.length });
      return mappedEvents;
=======
      const events = (response.data || []).map(mapMovementToEvent);
      logger.info('Movements fetched for animal', { animalId, count: events.length });
      return events;
>>>>>>> e20e61bd86ff804a2d2a6572dbafab410c4ef843
    } catch (error: any) {
      if (error.status === 404) {
        logger.info('No movements found for animal (404)', { animalId });
        return [];
      }
      logger.error('Failed to fetch movements for animal', { error, animalId });
      throw error;
    }
  }

  async create(data: CreateAnimalEventDto): Promise<AnimalEvent> {
    const response = await apiClient.post<BackendMovement>(this.getBasePath(), data);
    logger.info('Movement created', { id: response.id });
    return this.mapBackendMovementToAnimalEvent(response);
  }

  async update(id: string, data: UpdateAnimalEventDto): Promise<AnimalEvent> {
    const response = await apiClient.put<BackendMovement>(`${this.getBasePath()}/${id}`, data);
    logger.info('Movement updated', { id });
    return this.mapBackendMovementToAnimalEvent(response);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Movement deleted', { id });
  }
}

export const animalEventsService = new AnimalEventsService();
