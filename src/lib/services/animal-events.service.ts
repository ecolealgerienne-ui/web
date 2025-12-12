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

/**
 * Filter parameters for movements list
 */
export interface MovementsFilterParams {
  animalId?: string
  movementType?: string
  fromDate?: string
  toDate?: string
  limit?: number
  page?: number
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Paginated response
 */
export interface PaginatedMovementsResponse {
  events: AnimalEvent[]
  meta: PaginationMeta
}

// Type pour la réponse du backend (movements)
interface BackendMovementAnimal {
  animal: {
    id: string;
    visualId?: string;
    currentEid?: string;
    officialNumber?: string;
    sex?: string;
  };
}

interface BackendMovement {
  id: string;
  farmId: string;
  // Backend returns movementAnimals array and _count
  movementAnimals?: BackendMovementAnimal[];
  _count?: {
    movementAnimals: number;
  };
  // Legacy fields (keep for compatibility)
  animalIds?: string[];
  animalCount?: number;
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
  // Extract animal IDs from movementAnimals or use legacy animalIds
  const animalIds = movement.movementAnimals
    ? movement.movementAnimals.map(ma => ma.animal.id)
    : (movement.animalIds || []);

  // Get count from _count or movementAnimals length or legacy animalCount
  const animalCount = movement._count?.movementAnimals
    ?? movement.movementAnimals?.length
    ?? movement.animalCount
    ?? animalIds.length;

  return {
    id: movement.id,
    farmId: movement.farmId,
    animalIds,
    animalCount,
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

  async getAll(filters?: {
    animalId?: string;
    eventType?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<AnimalEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      // Map eventType to movementType for API compatibility
      if (filters?.eventType && filters.eventType !== 'all')
        params.append('movementType', filters.eventType);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      const url = params.toString()
        ? `${this.getBasePath()}?${params}`
        : this.getBasePath();
      // API returns paginated response: { data: [...], meta: {...} }
      // apiClient unwraps { success, data } -> { data: [...], meta }
      const response = await apiClient.get<{ data: BackendMovement[]; meta?: any }>(url);

      // Extract movements array from paginated response
      const movements = response?.data || [];

      // Map backend movements to frontend AnimalEvent format
      const events = movements.map(mapMovementToEvent);

      logger.info('Animal events (movements) fetched', {
        count: events.length,
      });
      return events;
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404 || err.status === 500) {
        logger.info('No movements found or endpoint unavailable', { status: err.status });
        return [];
      }
      // Return empty array instead of throwing to avoid breaking UI
      logger.warn('Failed to fetch movements, returning empty array', { error });
      return [];
    }
  }

  /**
   * Get all movements with pagination metadata
   */
  async getAllPaginated(filters?: MovementsFilterParams): Promise<PaginatedMovementsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.animalId) params.append('animalId', filters.animalId);
      // Map eventType to movementType for API compatibility
      if (filters?.movementType && filters.movementType !== 'all')
        params.append('movementType', filters.movementType);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);

      // Pagination
      const limit = filters?.limit || 10;
      const page = filters?.page || 1;
      params.append('limit', String(limit));
      params.append('page', String(page));

      const url = params.toString() ? `${this.getBasePath()}?${params}` : this.getBasePath();
      console.log('[animal-events] Fetching movements:', url);
      const response = await apiClient.get<{ data: BackendMovement[]; meta?: any }>(url);
      console.log('[animal-events] Backend response:', JSON.stringify(response, null, 2));

      const movements = response?.data || [];
      const meta = response?.meta || {};

      const events = movements.map(mapMovementToEvent);

      logger.info('Movements fetched (paginated)', { count: events.length, page, total: meta.total });

      return {
        events,
        meta: {
          total: meta.total || events.length,
          page: meta.page || page,
          limit: meta.limit || limit,
          totalPages: meta.totalPages || Math.ceil((meta.total || events.length) / limit),
        },
      };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404 || err.status === 500) {
        logger.info('No movements found (paginated)', { status: err.status });
        return { events: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
      logger.warn('Failed to fetch movements (paginated)', { error });
      return { events: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
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
      const response = await apiClient.get<{ data: BackendMovement[]; meta?: any }>(
        `${this.getBasePath()}?animalId=${animalId}`
      );
      const movements = response?.data || [];
      const events = movements.map(mapMovementToEvent);
      logger.info('Movements fetched for animal', {
        animalId,
        count: events.length,
      });
      return events;
    } catch (error: unknown) {
      const err = error as { status?: number };
      // Return empty array for any error to avoid breaking UI
      logger.warn('Failed to fetch movements for animal, returning empty', { animalId, status: err.status });
      return [];
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
