/**
 * Types pour la gestion des événements d'animaux (mouvements)
 * Aligné avec le backend PUT /api/v1/farms/{farmId}/movements/{id}
 */

export type AnimalEventType =
  | 'entry'
  | 'exit'
  | 'birth'
  | 'death'
  | 'sale'
  | 'purchase'
  | 'transfer_in'
  | 'transfer_out'
  | 'temporary_out'
  | 'temporary_return';

export type MovementStatus = 'ongoing' | 'closed' | 'archived';

export type BuyerType = 'individual' | 'professional' | 'farm' | 'slaughterhouse';

export type TemporaryType = 'veterinary' | 'exhibition' | 'breeding' | 'grazing' | 'other';

export interface AnimalEvent {
  id: string;
  farmId: string;
  // API uses animalIds (array) not animalId (single)
  animalIds: string[];
  animalCount?: number;
  movementType: AnimalEventType;
  movementDate: string;
  lotId?: string;
  reason?: string;
  status?: MovementStatus;
  notes?: string;

  // Sale fields
  buyerName?: string;
  buyerType?: BuyerType;
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
  temporaryType?: TemporaryType;
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

export interface CreateAnimalEventDto {
  animalIds: string[];
  movementType: AnimalEventType;
  movementDate: string;
  lotId?: string;
  reason?: string;
  status?: MovementStatus;
  notes?: string;

  // Sale fields
  buyerName?: string;
  buyerType?: BuyerType;
  buyerContact?: string;
  buyerFarmId?: string;
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
  temporaryType?: TemporaryType;
  expectedReturnDate?: string;
  returnDate?: string;
  returnNotes?: string;
  relatedMovementId?: string;

  // Document
  documentNumber?: string;
}

export interface UpdateAnimalEventDto {
  farmId?: string;
  animalIds?: string[];
  movementType?: AnimalEventType;
  movementDate?: string;
  lotId?: string;
  reason?: string;
  status?: MovementStatus;
  notes?: string;

  // Sale fields
  buyerName?: string;
  buyerType?: BuyerType;
  buyerContact?: string;
  buyerFarmId?: string;
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
  temporaryType?: TemporaryType;
  expectedReturnDate?: string;
  returnDate?: string;
  returnNotes?: string;
  relatedMovementId?: string;

  // Document and versioning
  documentNumber?: string;
  version?: number;
}
