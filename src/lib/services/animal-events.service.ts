/**
 * Service pour la gestion des événements d'animaux
 * Note: Uses /movements API endpoint as per WEB_API_SPECIFICATIONS.md
 */

import { apiClient } from '@/lib/api/client';
import { TEMP_FARM_ID } from '@/lib/auth/config';
import {
  AnimalEvent,
  AnimalEventType,
  CreateAnimalEventDto,
  UpdateAnimalEventDto,
  MovementStatus,
  BuyerType,
  TemporaryType,
} from '@/lib/types/animal-event';
import { Animal } from '@/lib/types/animal';
import { logger } from '@/lib/utils/logger';
import type { PaginatedResponse } from '@/lib/types/common/api';

/**
 * Paramètres de filtre pour la liste des événements d'animaux
 */
export interface AnimalEventFilterParams {
  page?: number;
  limit?: number;
  animalId?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
}

// Type pour la réponse du backend (movements)
interface BackendMovement {
  id: string;
  farmId: string;
  animalIds?: string[];
  lotId?: string;
  movementType: string;
  movementDate: string;
  reason?: string;
  status?: string;
  notes?: string;

  // Sale fields
  buyerName?: string;
  buyerType?: string;
  buyerContact?: string;
  buyerFarmId?: string;
  buyerQrSignature?: string;
  salePrice?: number;

  // Purchase fields
  sellerName?: string;
  purchasePrice?: number;

  // Transfer fields
  destinationFarmId?: string;
  originFarmId?: string;

  // Slaughter fields
  slaughterhouseName?: string;
  slaughterhouseId?: string;

  // Temporary movement fields
  isTemporary?: boolean;
  temporaryType?: string;
  expectedReturnDate?: string;
  returnDate?: string;
  returnNotes?: string;
  relatedMovementId?: string;

  // Document and versioning
  documentNumber?: string;
  version?: number;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Mapping backend movement -> frontend AnimalEvent
function mapMovementToEvent(movement: BackendMovement): AnimalEvent {
  return {
    id: movement.id,
    farmId: movement.farmId,
    animalIds: movement.animalIds || [],
    movementType: movement.movementType as AnimalEventType,
    movementDate: movement.movementDate,
    lotId: movement.lotId,
    reason: movement.reason,
    status: movement.status as MovementStatus | undefined,
    notes: movement.notes,

    // Sale fields
    buyerName: movement.buyerName,
    buyerType: movement.buyerType as BuyerType | undefined,
    buyerContact: movement.buyerContact,
    buyerFarmId: movement.buyerFarmId,
    buyerQrSignature: movement.buyerQrSignature,
    salePrice: movement.salePrice,

    // Purchase fields
    sellerName: movement.sellerName,
    purchasePrice: movement.purchasePrice,

    // Transfer fields
    destinationFarmId: movement.destinationFarmId,
    originFarmId: movement.originFarmId,

    // Slaughter fields
    slaughterhouseName: movement.slaughterhouseName,
    slaughterhouseId: movement.slaughterhouseId,

    // Temporary movement fields
    isTemporary: movement.isTemporary,
    temporaryType: movement.temporaryType as TemporaryType | undefined,
    expectedReturnDate: movement.expectedReturnDate,
    returnDate: movement.returnDate,
    returnNotes: movement.returnNotes,
    relatedMovementId: movement.relatedMovementId,

    // Document and versioning
    documentNumber: movement.documentNumber,
    version: movement.version,

    // Metadata
    createdAt: movement.createdAt,
    updatedAt: movement.updatedAt,
  };
}

// Mapping frontend AnimalEvent -> backend payload for create/update
function mapEventToPayload(data: CreateAnimalEventDto | UpdateAnimalEventDto): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if ('animalIds' in data && data.animalIds !== undefined) payload.animalIds = data.animalIds;
  if ('movementType' in data && data.movementType !== undefined) payload.movementType = data.movementType;
  if ('movementDate' in data && data.movementDate !== undefined) payload.movementDate = data.movementDate;
  if (data.lotId !== undefined) payload.lotId = data.lotId;
  if (data.reason !== undefined) payload.reason = data.reason;
  if (data.status !== undefined) payload.status = data.status;
  if (data.notes !== undefined) payload.notes = data.notes;

  // Sale fields
  if (data.buyerName !== undefined) payload.buyerName = data.buyerName;
  if (data.buyerType !== undefined) payload.buyerType = data.buyerType;
  if (data.buyerContact !== undefined) payload.buyerContact = data.buyerContact;
  if (data.buyerFarmId !== undefined) payload.buyerFarmId = data.buyerFarmId;
  if (data.salePrice !== undefined) payload.salePrice = data.salePrice;

  // Purchase fields
  if (data.sellerName !== undefined) payload.sellerName = data.sellerName;
  if (data.purchasePrice !== undefined) payload.purchasePrice = data.purchasePrice;

  // Transfer fields
  if (data.destinationFarmId !== undefined) payload.destinationFarmId = data.destinationFarmId;
  if (data.originFarmId !== undefined) payload.originFarmId = data.originFarmId;

  // Slaughter fields
  if (data.slaughterhouseName !== undefined) payload.slaughterhouseName = data.slaughterhouseName;
  if (data.slaughterhouseId !== undefined) payload.slaughterhouseId = data.slaughterhouseId;

  // Temporary movement fields
  if (data.isTemporary !== undefined) payload.isTemporary = data.isTemporary;
  if (data.temporaryType !== undefined) payload.temporaryType = data.temporaryType;
  if (data.expectedReturnDate !== undefined) payload.expectedReturnDate = data.expectedReturnDate;
  if (data.returnDate !== undefined) payload.returnDate = data.returnDate;
  if (data.returnNotes !== undefined) payload.returnNotes = data.returnNotes;
  if (data.relatedMovementId !== undefined) payload.relatedMovementId = data.relatedMovementId;

  // Document and versioning
  if (data.documentNumber !== undefined) payload.documentNumber = data.documentNumber;
  if ('version' in data && data.version !== undefined) payload.version = data.version;
  if ('farmId' in data && data.farmId !== undefined) payload.farmId = data.farmId;

  return payload;
}

class AnimalEventsService {
  private getBasePath(): string {
    return `/api/v1/farms/${TEMP_FARM_ID}/movements`;
  }

  /**
   * Récupère la liste paginée des événements d'animaux
   * Note: Le backend ne supporte pas encore la pagination côté serveur pour les mouvements
   * La pagination est donc simulée côté client
   */
  async getAll(params: AnimalEventFilterParams = {}): Promise<PaginatedResponse<AnimalEvent>> {
    try {
      const queryParams = new URLSearchParams();

      // Pagination params - stockés pour la pagination client
      const page = params.page || 1;
      const limit = Math.min(params.limit || 25, 100); // Max 100
      // Note: Ne pas envoyer page/limit au backend car il ne les supporte pas encore
      // queryParams.append('page', String(page));
      // queryParams.append('limit', String(limit));

      // Filtres
      if (params.animalId) queryParams.append('animalId', params.animalId);
      // Map eventType to movementType for API compatibility
      if (params.eventType && params.eventType !== 'all')
        queryParams.append('movementType', params.eventType);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.getBasePath()}?${queryString}` : this.getBasePath();
      const response = await apiClient.get<PaginatedResponse<BackendMovement> | BackendMovement[]>(url);

      // Handle both paginated and non-paginated responses from backend
      let allMovements: BackendMovement[];

      if (Array.isArray(response)) {
        // Backend returns array (non-paginated)
        allMovements = response;
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        // Backend returns paginated response
        allMovements = response.data;
      } else {
        // Fallback for unexpected format
        allMovements = [];
      }

      // Client-side pagination since backend doesn't support it yet
      const total = allMovements.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMovements = allMovements.slice(startIndex, endIndex);

      const meta = { total, page, limit, totalPages };

      // Map backend movements to frontend AnimalEvent format
      const events = paginatedMovements.map(mapMovementToEvent);

      logger.info('Animal events (movements) fetched', {
        total: meta.total,
        page: meta.page,
        limit: meta.limit
      });

      return { data: events, meta };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No movements found (404)');
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
      logger.error('Failed to fetch movements', { error });
      throw error;
    }
  }

  async getById(id: string): Promise<AnimalEvent | null> {
    try {
      const response = await apiClient.get<BackendMovement>(
        `${this.getBasePath()}/${id}`
      );
      logger.info('Movement fetched', { id });
      return mapMovementToEvent(response);
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('Movement not found (404)', { id });
        return null;
      }
      logger.error('Failed to fetch movement', { error, id });
      throw error;
    }
  }

  async getByAnimalId(animalId: string): Promise<AnimalEvent[]> {
    try {
      const movements = await apiClient.get<BackendMovement[]>(
        `${this.getBasePath()}?animalId=${animalId}`
      );
      const events = (movements || []).map(mapMovementToEvent);
      logger.info('Movements fetched for animal', {
        animalId,
        count: events.length,
      });
      return events;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No movements found for animal (404)', { animalId });
        return [];
      }
      logger.error('Failed to fetch movements for animal', { error, animalId });
      throw error;
    }
  }

  async create(data: CreateAnimalEventDto): Promise<AnimalEvent> {
    const payload = mapEventToPayload(data);
    const response = await apiClient.post<BackendMovement>(
      this.getBasePath(),
      payload
    );
    logger.info('Movement created', { id: response.id });
    return mapMovementToEvent(response);
  }

  async update(id: string, data: UpdateAnimalEventDto): Promise<AnimalEvent> {
    const payload = mapEventToPayload(data);
    const response = await apiClient.put<BackendMovement>(
      `${this.getBasePath()}/${id}`,
      payload
    );
    logger.info('Movement updated', { id });
    return mapMovementToEvent(response);
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.getBasePath()}/${id}`);
    logger.info('Movement deleted', { id });
  }

  async getAnimals(movementId: string): Promise<Animal[]> {
    try {
      const url = `${this.getBasePath()}/${movementId}/animals`;
      const animals = await apiClient.get<Animal[]>(url);
      logger.info('Animals fetched for movement', {
        movementId,
        count: (animals || []).length,
      });
      return animals || [];
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        logger.info('No animals found for movement (404)', { movementId });
        return [];
      }
      logger.error('Failed to fetch animals for movement', { error, movementId });
      throw error;
    }
  }
}

export const animalEventsService = new AnimalEventsService();
